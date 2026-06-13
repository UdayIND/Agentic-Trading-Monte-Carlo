"""Monte Carlo stress test of the v2 system's statistical skeleton.

THIS IS NOT A BACKTEST. It simulates the strategy's *rules* (risk %, R
distributions, regime gating, breaker, loss-streak halving, core trend
filter) against a synthetic regime-switching market. Results are driven by
the input assumptions, which are printed alongside output. Seeded for
reproducibility.

Usage: python3 montecarlo_v2.py [n_sims] [--wr-shift X] [--payoff-mult Y]
"""
import random, math, statistics, sys

# ---------------- Assumptions (the things that dominate results) ----------
ASSUMPTIONS = {
    # Market regime daily params: (mu, sigma) of QQQ daily returns
    "bull":  (0.0008, 0.011),
    "chop":  (0.0000, 0.013),
    "bear":  (-0.0012, 0.024),
    # Regime transition probs per day (row-stochastic)
    "trans": {
        "bull": {"bull": 0.995, "chop": 0.004, "bear": 0.001},
        "chop": {"bull": 0.006, "chop": 0.988, "bear": 0.006},
        "bear": {"bull": 0.002, "chop": 0.010, "bear": 0.988},
    },
    "jump_prob": 0.002, "jump_size": -0.045,    # rare gap shock any day
    # Satellite trade engine
    "win_rate": {"bull": 0.45, "chop": 0.40},   # NO bear trading (posture)
    "trades_per_day": {"bull": 0.30, "chop": 0.15},
    "risk_pct": {"bull": 0.015, "chop": 0.010},
    "max_open": {"bull": 3, "chop": 2},
    "hold_days_mean": 8,
    # R-multiple outcome distributions (slippage/cost already netted)
    "win_R":  [(1.0, 0.35), (2.0, 0.40), (4.0, 0.20), (6.0, 0.05)],  # E=2.25R
    "loss_R": [(-1.0, 0.85), (-1.4, 0.12), (-2.5, 0.03)],            # E=-1.10R
    # Core sleeve: QQQ exposure by *detected* regime (3-day detection lag)
    "core_w": {"bull": 0.40, "chop": 0.20, "bear": 0.0},
    # Risk plumbing
    "breaker_dd": 0.08, "breaker_cooldown": 5,
    "streak_halve_after": 3,
    "ruin_level": 0.70,   # "ruin" = -30% from start (system has failed utterly)
}

DAYS_YEAR = 252
HORIZON_Y = 3

def draw(dist, rng):
    x, acc = rng.random(), 0.0
    for v, p in dist:
        acc += p
        if x <= acc: return v
    return dist[-1][0]

def sim_one(rng, a, wr_shift=0.0, payoff_mult=1.0):
    eq, hwm, qqq = 1.0, 1.0, 1.0
    anchor = 1.0               # breaker anchor: resets to equity after a trip (V3 fix)
    regime, detected, det_lag = "bull", "bull", 0
    open_trades = []           # (exit_day, outcome_R, risk_frac)
    cooldown, streak, breaker_trips = 0, 0, 0
    halfrisk_trades, paper_until, trip_days = 0, -1, []
    underwater_days, max_dd = 0, 0.0
    eq_path_1y = None
    for day in range(DAYS_YEAR * HORIZON_Y):
        # --- market ---
        mu, sg = a[regime]
        r_mkt = rng.gauss(mu, sg)
        if rng.random() < a["jump_prob"]: r_mkt += a["jump_size"]
        qqq *= (1 + r_mkt)
        # regime transition + detection lag
        t = a["trans"][regime]; x = rng.random()
        nr = "bull" if x < t["bull"] else ("chop" if x < t["bull"] + t["chop"] else "bear")
        if nr != regime: regime, det_lag = nr, 3
        if det_lag > 0:
            det_lag -= 1
            if det_lag == 0: detected = regime
        # --- core sleeve ---
        eq *= (1 + a["core_w"][detected] * r_mkt)
        # --- satellite exits ---
        still = []
        for (ed, oR, rf) in open_trades:
            if day >= ed:
                eq *= (1 + oR * rf)
                streak = streak + 1 if oR < 0 else 0
            else: still.append((ed, oR, rf))
        open_trades = still
        # --- breaker / housekeeping ---
        hwm = max(hwm, eq)
        anchor = max(anchor, eq)      # ratchets like HWM, but resets after a trip
        dd = 1 - eq / hwm
        max_dd = max(max_dd, dd)
        if dd > 0: underwater_days += 1
        if cooldown > 0:
            cooldown -= 1
            if cooldown == 0: anchor = eq            # re-arm at resumption equity
        elif 1 - eq / anchor >= a["breaker_dd"]:
            open_trades = []          # flatten satellites at current marks
            cooldown = a["breaker_cooldown"]
            breaker_trips += 1
            halfrisk_trades = 10                     # resume at half risk
            trip_days.append(day)
            if len(trip_days) >= 2 and day - trip_days[-2] <= 126:
                paper_until = day + 40               # two trips/6m -> 8-week paper gate
        # --- satellite entries ---
        if detected in a["trades_per_day"] and cooldown == 0 and day > paper_until:
            if len(open_trades) < a["max_open"][detected] and rng.random() < a["trades_per_day"][detected]:
                wr = a["win_rate"][detected] + wr_shift
                risk = a["risk_pct"][detected]
                if streak >= a["streak_halve_after"]: risk *= 0.5
                if halfrisk_trades > 0:
                    risk *= 0.5
                    halfrisk_trades -= 1
                oR = draw(a["win_R"], rng) * payoff_mult if rng.random() < wr else draw(a["loss_R"], rng)
                hold = max(2, int(rng.expovariate(1 / a["hold_days_mean"])))
                open_trades.append((day + hold, oR, risk))
        if day == DAYS_YEAR - 1: eq_path_1y = (eq, qqq, max_dd)
    return {"eq3": eq, "qqq3": qqq, "mdd": max_dd, "uw": underwater_days / (DAYS_YEAR * HORIZON_Y),
            "trips": breaker_trips, "y1": eq_path_1y}

def pct(xs, p):
    s = sorted(xs); k = (len(s) - 1) * p
    f = math.floor(k); c = min(f + 1, len(s) - 1)
    return s[f] + (s[c] - s[f]) * (k - f)

def run(n, seed=42, wr_shift=0.0, payoff_mult=1.0, label=""):
    rng = random.Random(seed)
    a = ASSUMPTIONS
    res = [sim_one(rng, a, wr_shift, payoff_mult) for _ in range(n)]
    cagr3 = [r["eq3"] ** (1 / HORIZON_Y) - 1 for r in res]
    cagr1 = [r["y1"][0] - 1 for r in res]
    mdd   = [r["mdd"] for r in res]
    uw    = [r["uw"] for r in res]
    beat3 = sum(1 for r in res if r["eq3"] > r["qqq3"]) / n
    beat1 = sum(1 for r in res if r["y1"][0] > r["y1"][1]) / n
    ruin  = sum(1 for r in res if r["eq3"] < a["ruin_level"]) / n
    neg3  = sum(1 for r in res if r["eq3"] < 1.0) / n
    trips = statistics.mean(r["trips"] for r in res)
    print(f"\n=== {label or 'BASE'}  n={n}  seed={seed}  wr_shift={wr_shift:+.2f}  payoff×{payoff_mult} ===")
    print(f"CAGR(3y): mean {statistics.mean(cagr3):+.1%}  median {pct(cagr3,0.5):+.1%}  "
          f"p5 {pct(cagr3,0.05):+.1%}  p25 {pct(cagr3,0.25):+.1%}  p75 {pct(cagr3,0.75):+.1%}  p95 {pct(cagr3,0.95):+.1%}")
    print(f"1y return: mean {statistics.mean(cagr1):+.1%}  median {pct(cagr1,0.5):+.1%}  "
          f"p5 {pct(cagr1,0.05):+.1%}  p95 {pct(cagr1,0.95):+.1%}")
    print(f"MaxDD(3y): mean {statistics.mean(mdd):.1%}  median {pct(mdd,0.5):.1%}  p95 {pct(mdd,0.95):.1%}  worst {max(mdd):.1%}")
    print(f"Time underwater: mean {statistics.mean(uw):.0%}  p95 {pct(uw,0.95):.0%}")
    print(f"P(beat QQQ): 1y {beat1:.0%}   3y {beat3:.0%}")
    print(f"P(negative 3y) {neg3:.0%}   P(ruin: -30%) {ruin:.2%}   breaker trips/3y mean {trips:.2f}")
    return res

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    run(n)
    if "--sensitivity" in sys.argv:
        run(n, label="EDGE EROSION: win rate -5pts", wr_shift=-0.05)
        run(n, label="EDGE GONE: win rate -10pts", wr_shift=-0.10)
        run(n, label="FAT WINNERS CUT: payoff ×0.8", payoff_mult=0.8)
        run(n, label="BOTH STRESSED: wr -5pts, payoff ×0.8", wr_shift=-0.05, payoff_mult=0.8)
