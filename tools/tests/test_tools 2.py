#!/usr/bin/env python3
"""Unit tests for the deterministic tooling. Run:
   python3 -m unittest discover -s tools/tests -v
"""
import unittest, sys, os, math, datetime as dt

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import regime, metrics, runlock
from guard import run_checks, wilder_atr14

NOW = dt.datetime(2026, 6, 15, 14, 30, tzinfo=dt.timezone.utc)


def synth_closes(n, start=100.0, drift=0.001, wobble=0.0):
    """Deterministic synthetic price series."""
    closes, p = [], start
    for i in range(n):
        p *= (1 + drift + wobble * math.sin(i / 3.0))
        closes.append((f"d{i}", p))
    return closes


class TestRegime(unittest.TestCase):
    def test_bull_quiet(self):
        r = regime.classify(synth_closes(300, drift=0.001))
        self.assertEqual(r["trend"], "BULL")
        self.assertEqual(r["regime"], "BULL_QUIET")

    def test_bear(self):
        r = regime.classify(synth_closes(300, drift=-0.001))
        self.assertEqual(r["trend"], "BEAR")
        self.assertIn(r["regime"], ("BEAR_QUIET", "BEAR_CRISIS"))

    def test_vol_spike_detected(self):
        closes = synth_closes(280, drift=0.001)
        p = closes[-1][1]
        for i in range(20):  # violent alternating final month
            p *= 1.04 if i % 2 == 0 else 0.962
            closes.append((f"v{i}", p))
        r = regime.classify(closes)
        self.assertEqual(r["vol"], "HIGH")
        self.assertGreater(r["rv_percentile"], 75)

    def test_insufficient_bars(self):
        self.assertIn("error", regime.classify(synth_closes(100)))

    def test_posture_consistency(self):
        for code, p in regime.POSTURE.items():
            self.assertLessEqual(p["heat_cap"],
                                 p["max_satellites"] * p["risk_pct"] + 1e-9,
                                 f"{code}: heat cap unreachable (audit C1 class)")


class TestMetrics(unittest.TestCase):
    def curve(self, equities, dates=None, cash_frac=0.5):
        return [{"date": dates[i] if dates else f"2026-01-{i+1:02d}",
                 "equity": str(e), "cash": str(e * cash_frac),
                 "heat_pct": "1.0", "regime": "BULL_QUIET"} for i, e in enumerate(equities)]

    def test_deposit_not_counted_as_gain(self):
        rows = self.curve([1000, 2000], dates=["2026-01-01", "2026-01-02"])
        flows = [{"date": "2026-01-02", "amount": "1000", "type": "deposit", "note": ""}]
        m = metrics.compute(rows, flows, [])
        self.assertAlmostEqual(m["twr_total"], 0.0, places=9)
        self.assertAlmostEqual(m["max_drawdown"], 0.0, places=9)

    def test_simple_gain(self):
        m = metrics.compute(self.curve([1000, 1100]), [], [])
        self.assertAlmostEqual(m["twr_total"], 0.10, places=9)

    def test_drawdown(self):
        m = metrics.compute(self.curve([1000, 1200, 900, 1000]), [], [])
        self.assertAlmostEqual(m["max_drawdown"], 0.25, places=9)

    def test_trade_stats(self):
        trades = [{"realized_r": 2.0, "realized_usd": 30}] * 4 + \
                 [{"realized_r": -1.0, "realized_usd": -15}] * 6
        m = metrics.compute(self.curve([1000, 1001]), [], trades)
        self.assertAlmostEqual(m["win_rate"], 0.4)
        self.assertAlmostEqual(m["expectancy_r"], 0.2)
        self.assertAlmostEqual(m["profit_factor"], 120 / 90, places=3)
        self.assertTrue(any("n>=20" in s for s in m["insufficient"]))


class TestGuard(unittest.TestCase):
    def setUp(self):
        n = 40
        self.bars = [{"high": 102.0, "low": 98.0, "close": 100.0} for _ in range(n)]
        self.atr = wilder_atr14(self.bars)  # = 4.0
        self.quote = {"bid": 99.9, "ask": 100.1, "last": 100.0,
                      "ts": NOW.isoformat(), "state": "active", "prev_close": 100.0}
        self.state = {"regime_code": "BULL_QUIET", "circuit_breaker": False,
                      "cooldown_until": None, "consecutive_losses": 0,
                      "entries_today": 0, "entries_today_date": None,
                      "weekly_order_count": 0}
        self.portfolio = {"equity": 1000.0, "cash": 600.0, "buying_power": 600.0}
        self.ticket = {"symbol": "XYZ", "side": "buy", "type": "limit",
                       "limit_price": 100.10, "stop_price": 92.0, "quantity": 1,
                       "account_number": "825795594", "playbook": "PB",
                       "earnings_date": "2026-07-30", "target_price": 117.0}

    def run_t(self, **over):
        t = {**self.ticket, **over.pop("ticket", {})}
        s = {**self.state, **over.pop("state", {})}
        pf = {**self.portfolio, **over.pop("portfolio", {})}
        checks = run_checks(t, s, pf, over.pop("positions", []),
                            over.pop("orders", []), self.quote, self.bars, NOW)
        return [c["name"] for c in checks if not c["ok"]]

    def test_clean_pass(self):
        self.assertEqual(self.run_t(), [])

    def test_wrong_account(self):
        self.assertIn("account", self.run_t(ticket={"account_number": "565068103"}))

    def test_breaker_blocks(self):
        self.assertIn("no_circuit_breaker", self.run_t(state={"circuit_breaker": True}))

    def test_oversized_risk(self):
        # 3 shares * $8.10 stop distance = $24.3 > 1.5% of 1000 = $15
        fails = self.run_t(ticket={"quantity": 3})
        self.assertTrue({"shares_match_formula", "risk_per_trade"} & set(fails))

    def test_stop_too_tight(self):
        self.assertIn("stop_not_too_tight", self.run_t(ticket={"stop_price": 98.0}))

    def test_missing_stop(self):
        self.assertIn("stop_present", self.run_t(ticket={"stop_price": None}))

    def test_earnings_too_close(self):
        self.assertIn("earnings_distance", self.run_t(ticket={"earnings_date": "2026-06-20"}))

    def test_duplicate_order(self):
        orders = [{"symbol": "XYZ", "side": "buy", "state": "confirmed", "type": "limit"}]
        self.assertIn("no_duplicate_order", self.run_t(orders=orders))

    def test_regime_blocks_playbook(self):
        fails = self.run_t(state={"regime_code": "RANGE"}, ticket={"playbook": "BO"})
        self.assertIn("playbook_active", fails)

    def test_bear_crisis_blocks_everything(self):
        self.assertIn("regime_allows_entries", self.run_t(state={"regime_code": "BEAR_CRISIS"}))

    def test_rr_floor(self):
        self.assertIn("reward_risk", self.run_t(ticket={"target_price": 108.0}))

    def test_cash_floor(self):
        # notional 100.10 leaves cash 99.9 → 9.99% < 10% floor (cash=200)
        fails = self.run_t(portfolio={"cash": 200.0, "buying_power": 200.0})
        self.assertIn("cash_floor", fails)

    def test_protective_sell_skips_entry_checks(self):
        pos = [{"symbol": "XYZ", "quantity": "1", "average_buy_price": "100"}]
        fails = self.run_t(ticket={"side": "sell", "is_protective_exit": True,
                                   "quantity": 1}, positions=pos,
                           state={"circuit_breaker": False})
        self.assertEqual(fails, [])

    def test_tempo_cap(self):
        fails = self.run_t(state={"entries_today": 2,
                                  "entries_today_date": NOW.date().isoformat()})
        self.assertIn("entries_per_day", fails)


class TestRunlock(unittest.TestCase):
    def setUp(self):
        if os.path.exists(runlock.LOCK):
            os.remove(runlock.LOCK)

    tearDown = setUp

    def test_acquire_and_conflict(self):
        ok, _ = runlock.acquire("a")
        self.assertTrue(ok)
        ok2, _ = runlock.acquire("b")
        self.assertFalse(ok2)
        self.assertTrue(runlock.release("a"))

    def test_stale_takeover(self):
        import time
        runlock.acquire("old", now=time.time() - 3 * 3600)
        ok, info = runlock.acquire("new")
        self.assertTrue(ok)
        self.assertEqual(info["takeover_from"], "old")
        runlock.release("new")


if __name__ == "__main__":
    unittest.main()
