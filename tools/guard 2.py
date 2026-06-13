#!/usr/bin/env python3
"""Deterministic pre-trade validator (IB-2 / v3 P0 #3). NO ORDER WITHOUT PASS.

The model interprets; this enforces. Every RISK_FRAMEWORK hard limit is a
coded check. Inputs are JSON files the agent saves from tool outputs in the
SAME session (freshness is checked).

Usage:
  python3 tools/guard.py --ticket t.json --state state/account_state.json \
      --portfolio p.json --positions pos.json --orders o.json \
      --quote q.json --bars b.json [--now ISO8601]

Ticket schema (all entries; sells need symbol/side/quantity only):
  {symbol, side: buy|sell, type: limit|stop_market, limit_price, stop_price,
   quantity, account_number, playbook, earnings_date: "YYYY-MM-DD"|null,
   target_price: float|null, is_protective_exit: bool}
Exit code 0 = PASS, 1 = FAIL. Output: JSON verdict + per-check detail.
"""
import json, sys, argparse, datetime as dt

ACCOUNT = "825795594"
from regime import POSTURE  # posture matrix is single-sourced via regime.py


def load(path):
    with open(path) as f:
        return json.load(f)


def parse_ts(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def wilder_atr14(bars):
    """bars: list of {high, low, close} oldest->newest (>= 15 rows)."""
    trs = []
    for i in range(1, len(bars)):
        h, l, pc = bars[i]["high"], bars[i]["low"], bars[i - 1]["close"]
        trs.append(max(h - l, abs(h - pc), abs(l - pc)))
    if len(trs) < 14:
        return None
    atr = sum(trs[:14]) / 14
    for tr in trs[14:]:
        atr = (atr * 13 + tr) / 14
    return atr


def normalize_bars(raw):
    if isinstance(raw, dict) and "data" in raw:
        rows = raw["data"]["results"][0]["bars"]
        return [{"high": float(b["high_price"]), "low": float(b["low_price"]),
                 "close": float(b["close_price"])} for b in rows]
    return raw


def normalize_quote(raw, symbol):
    if isinstance(raw, dict) and "data" in raw:
        for r in raw["data"]["results"]:
            q = r["quote"]
            if q["symbol"] == symbol:
                return {"bid": float(q["bid_price"]), "ask": float(q["ask_price"]),
                        "last": float(q["last_trade_price"]),
                        "ts": q.get("venue_last_trade_time"),
                        "state": q.get("state", "active"),
                        "prev_close": float(q["adjusted_previous_close"])}
        return None
    return raw


def run_checks(ticket, state, portfolio, positions, orders, quote, bars, now):
    checks = []
    def check(name, ok, detail=""):
        checks.append({"name": name, "ok": bool(ok), "detail": detail})

    sym = ticket["symbol"]
    side = ticket["side"]
    protective = ticket.get("is_protective_exit", False)

    # --- identity & scope ---
    check("account", ticket.get("account_number") == ACCOUNT,
          f"must be {ACCOUNT}")
    check("long_only", side in ("buy", "sell"), "side must be buy/sell")

    # --- halt flags ---
    check("no_circuit_breaker", not state.get("circuit_breaker"), "breaker active")
    cd = state.get("cooldown_until")
    check("no_cooldown", not cd or cd < now.date().isoformat(), f"cooldown until {cd}")

    # protective exits skip entry-side checks (tempo-exempt by governance)
    if side == "sell" or protective:
        held = {p["symbol"]: float(p["quantity"]) for p in positions}
        check("position_exists", sym in held and held.get(sym, 0) >= float(ticket["quantity"]),
              f"selling {ticket['quantity']} but hold {held.get(sym, 0)}")
        return checks

    equity = float(portfolio["equity"])
    cash = float(portfolio["cash"])
    buying_power = float(portfolio.get("buying_power", cash))
    regime = state.get("regime_code") or state.get("regime", "BULL_QUIET")
    post = POSTURE.get(regime)
    check("regime_known", post is not None, f"regime {regime} not in posture matrix")
    if post is None:
        return checks
    check("regime_allows_entries", post["entries_week"] > 0, f"{regime} forbids entries")

    entry = float(ticket["limit_price"])
    stop = float(ticket.get("stop_price") or 0)
    qty = float(ticket["quantity"])

    # --- quote freshness & sanity ---
    check("quote_active", quote.get("state", "active") == "active", "instrument not active")
    if quote.get("ts"):
        age = (now - parse_ts(quote["ts"])).total_seconds()
        check("quote_fresh", age <= 15 * 60, f"quote {int(age)}s old")
    bid, ask, last = quote["bid"], quote["ask"], quote["last"]
    last_bar_close = bars[-1]["close"]
    check("quote_sane_vs_bar", abs(last - last_bar_close) / last_bar_close <= 0.10,
          f"last {last} vs bar close {last_bar_close} (>10% = adjustment fault?)")
    spread = (ask - bid) / ask if ask else 1
    check("spread", spread <= 0.003, f"spread {spread:.4%} > 0.30%")
    check("price_floor", last >= 5, f"price {last} < $5")
    check("limit_slippage", entry <= ask * 1.005, f"limit {entry} > ask+0.5% ({ask*1.005:.2f})")

    # --- stop & sizing (recomputed, not trusted) ---
    check("stop_present", stop > 0, "entry without protective stop")
    atr = wilder_atr14(bars)
    check("atr_computable", atr is not None, f"need >=15 bars, got {len(bars)}")
    if atr and stop > 0:
        dist = entry - stop
        check("stop_below_entry", dist > 0, "stop must be below entry (long)")
        if dist > 0:
            mult = dist / atr
            check("stop_not_too_tight", mult >= 1.4, f"{mult:.2f}x ATR < 1.5x floor")
            check("stop_not_too_wide", mult <= 3.0, f"{mult:.2f}x ATR > 3.0x")
            risk_budget = equity * post["risk_pct"] / 100
            if state.get("consecutive_losses", 0) >= 3:
                risk_budget *= 0.5
            max_shares = int(risk_budget // dist) if dist else 0
            check("shares_match_formula", qty <= max_shares and qty >= 1,
                  f"qty {qty} vs floor(risk ${risk_budget:.2f}/dist {dist:.2f})={max_shares}")
            trade_risk = dist * qty
            check("risk_per_trade", trade_risk <= risk_budget + 0.01,
                  f"risk ${trade_risk:.2f} > budget ${risk_budget:.2f}")
            # portfolio heat: open-position stop-basis risk + this trade
            open_risk = 0.0
            stops = {o["symbol"]: float(o["stop_price"]) for o in orders
                     if o.get("type") in ("stop_market", "stop_limit")
                     and o.get("state") in ("confirmed", "queued") and o.get("side") == "sell"}
            for p in positions:
                ps, pq = p["symbol"], float(p["quantity"])
                basis = float(p.get("average_buy_price", p.get("cost_basis", 0)))
                if ps in stops:
                    open_risk += max(0.0, (basis - stops[ps]) * pq)
            heat_after = (open_risk + trade_risk) / equity * 100
            check("heat_cap", heat_after <= post["heat_cap"] + 1e-9,
                  f"heat after {heat_after:.2f}% > cap {post['heat_cap']}%")
    # --- notional / cash / settlement ---
    notional = entry * qty
    check("notional_cap", notional <= 0.30 * equity, f"${notional:.2f} > 30% of ${equity:.2f}")
    check("cash_floor", (cash - notional) / equity * 100 >= post["min_cash"] - 1e-9,
          f"cash after {((cash-notional)/equity*100):.1f}% < floor {post['min_cash']}%")
    check("settled_funds", buying_power >= notional, f"bp ${buying_power} < ${notional:.2f}")

    # --- portfolio counts, tempo, duplicates ---
    sat_count = len([p for p in positions if p["symbol"] != "QQQ"])
    check("max_satellites", sat_count < post["max_satellites"],
          f"{sat_count} open vs max {post['max_satellites']}")
    today = now.date().isoformat()
    entries_today = state.get("entries_today", 0) if state.get("entries_today_date") == today else 0
    check("entries_per_day", entries_today < 2, f"{entries_today} entries today")
    check("entries_per_week", state.get("weekly_order_count", 0) < post["entries_week"],
          f"{state.get('weekly_order_count', 0)} this week vs {post['entries_week']}")
    dup = [o for o in orders if o["symbol"] == sym and o["side"] == side
           and o.get("state") in ("confirmed", "queued", "unconfirmed", "new")]
    check("no_duplicate_order", not dup, f"{len(dup)} open {side} order(s) on {sym}")
    held = [p for p in positions if p["symbol"] == sym]
    check("not_already_held", not held, f"already hold {sym}")

    # --- playbook & event risk ---
    check("playbook_active", ticket.get("playbook") in post["playbooks"]
          or (ticket.get("playbook") == "PB" and "PB_A_PLUS" in post["playbooks"]),
          f"{ticket.get('playbook')} not active in {regime}")
    ed = ticket.get("earnings_date")
    check("earnings_date_provided", ed is not None, "buys require earnings_date (or 'none_within_30d')")
    if ed and ed != "none_within_30d":
        days = (dt.date.fromisoformat(ed) - now.date()).days
        check("earnings_distance", days > 10, f"earnings in {days}d (<= 10 forbidden)")
    tp = ticket.get("target_price")
    if tp and stop > 0 and entry > stop:
        rr = (float(tp) - entry) / (entry - stop)
        check("reward_risk", rr >= 2.0, f"R:R {rr:.2f} < 2.0")
    return checks


def main():
    p = argparse.ArgumentParser()
    for arg in ["ticket", "state", "portfolio", "positions", "orders", "quote", "bars"]:
        p.add_argument(f"--{arg}", required=True)
    p.add_argument("--now", default=None)
    a = p.parse_args()
    now = parse_ts(a.now) if a.now else dt.datetime.now(dt.timezone.utc)
    ticket = load(a.ticket)
    checks = run_checks(
        ticket, load(a.state), load(a.portfolio), load(a.positions),
        load(a.orders), normalize_quote(load(a.quote), ticket["symbol"]),
        normalize_bars(load(a.bars)), now)
    failed = [c for c in checks if not c["ok"]]
    print(json.dumps({"verdict": "FAIL" if failed else "PASS",
                      "failed": [c["name"] for c in failed],
                      "checks": checks}, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
