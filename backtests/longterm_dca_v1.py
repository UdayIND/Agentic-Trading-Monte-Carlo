"""Monte Carlo of the LONG_TERM_PLAN (v8.1): $500 initial + $500/month,
CORE (DCA index) + SATELLITE (v8 rule skeleton), 35% unit-NAV floor.

THIS IS NOT A BACKTEST OF HISTORY. It simulates the plan's RULES against a
synthetic regime-switching market; results are driven by the printed
assumptions. Compares three arms on identical flows:
  PLAN      core+satellite per strategy/LONG_TERM_PLAN.md
  DCA_QQQ   100% index DCA (the passive benchmark)
  SAT_ONLY  100% satellite (what "all high-risk" would look like)
Usage: python longterm_dca_v1.py [n_sims] [months]
"""
import random, statistics, sys

A = {
    # Monthly market regime params (mu, sigma) — deliberately humbler than
    # 2010s realized QQQ; long-run blend ~8-9%/yr nominal before vol drag.
    "bull": (0.018, 0.045), "chop": (0.000, 0.055), "bear": (-0.025, 0.080),
    "trans": {"bull": {"bull": .94, "chop": .04, "bear": .02},
              "chop": {"bull": .10, "chop": .85, "bear": .05},
              "bear": {"bull": .06, "chop": .10, "bear": .84}},
    "jump_prob": 0.01, "jump": -0.12,          # rare monthly crash shock
    # Satellite engine (v8 skeleton, same R dists as montecarlo_v2.py)
    "trades_mo": {"bull": 1.5, "chop": 0.75, "bear": 0.0},   # posture: no bear trading
    "win_rate": {"bull": 0.45, "chop": 0.40, "bear": 0.0},
    "win_R":  [(1.0, .35), (2.0, .40), (4.0, .20), (6.0, .05)],   # E=+2.25R
    "loss_R": [(-1.0, .85), (-1.4, .12), (-2.5, .03)],            # E=-1.10R
    "risk_frac": 0.05,            # v8: 5% of TOTAL equity per trade
    "streak_halve": 3,            # after 3 straight losses, half risk til a win
    # Plan allocation
    "init": 500.0, "monthly": 500.0,
    "core_catchup_until": 0.55,   # deposits 100% core until core>=55% of equity
    "split_core": 350.0, "split_sat": 150.0,
    # Floor protocol (v8): 35% unit-NAV DD -> satellite paper 3mo, half-risk 3mo
    "floor_dd": 0.35, "paper_mo": 3, "half_mo": 3,
}

def draw(dist, rng):
    x, acc = rng.random(), 0.0
    for v, p in dist:
        acc += p
        if x <= acc: return v
    return dist[-1][0]

def sat_month(rng, regime, equity, sat_bal, risk_mult, streak):
    """One month of satellite trading. Returns (pnl, new_streak)."""
    lam = A["trades_mo"][regime]
    n = int(lam) + (1 if rng.random() < (lam - int(lam)) else 0)
    pnl = 0.0
    for _ in range(n):
        if sat_bal + pnl <= 0: break
        risk = A["risk_frac"] * equity * risk_mult
        risk = min(risk, max(0.0, sat_bal + pnl))       # can't risk more than sleeve
        if rng.random() < A["win_rate"][regime]:
            pnl += draw(A["win_R"], rng) * risk; streak = 0
        else:
            pnl += draw(A["loss_R"], rng) * risk; streak += 1
    return pnl, streak

def sim(rng, months, arm):
    core = sat = 0.0
    if arm == "DCA_QQQ": core = A["init"]
    else:                sat  = A["init"]
    regime = "bull"
    nav, nav_peak, max_dd = 1.0, 1.0, 0.0
    paper, half, streak, floor_hits = 0, 0, 0, 0
    snaps = {}
    for m in range(1, months + 1):
        eq0 = core + sat
        # market month
        mu, sg = A[regime]
        r = rng.gauss(mu, sg)
        if rng.random() < A["jump_prob"]: r += A["jump"]
        t = A["trans"][regime]; x = rng.random()
        regime = "bull" if x < t["bull"] else ("chop" if x < t["bull"] + t["chop"] else "bear")
        pnl = core * r
        # satellite month
        if arm != "DCA_QQQ" and sat > 0 and paper == 0:
            mult = 0.5 if (half > 0 or streak >= A["streak_halve"]) else 1.0
            sp, streak = sat_month(rng, regime, eq0, sat, mult, streak)
            pnl += sp; sat += sp
        core += core * r
        if paper > 0: paper -= 1
        elif half > 0: half -= 1
        # unit NAV (TWR) BEFORE flows
        if eq0 > 0:
            nav *= (1 + pnl / eq0)
            nav_peak = max(nav_peak, nav)
            dd = 1 - nav / nav_peak
            max_dd = max(max_dd, dd)
            if dd >= A["floor_dd"] and paper == 0 and half == 0 and arm != "DCA_QQQ":
                floor_hits += 1           # satellite flattens (sleeve = cash, no trades)
                paper, half = A["paper_mo"], A["half_mo"]
                nav_peak = nav            # re-arm (v3 breaker fix analogue)
        # monthly contribution
        c = A["monthly"]
        if arm == "DCA_QQQ": core += c
        elif arm == "SAT_ONLY": sat += c
        else:
            if core < A["core_catchup_until"] * (core + sat + c): core += c
            else: core += A["split_core"]; sat += A["split_sat"]
        if m in (12, 36, 60, 120): snaps[m] = core + sat
    return snaps, max_dd, floor_hits

def pct(xs, p):
    xs = sorted(xs); k = max(0, min(len(xs) - 1, int(p / 100 * len(xs))))
    return xs[k]

def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10000
    months = int(sys.argv[2]) if len(sys.argv) > 2 else 120
    horizons = [h for h in (12, 36, 60, 120) if h <= months]
    contrib = {h: A["init"] + A["monthly"] * h for h in horizons}
    print(f"=== LONG_TERM_PLAN MC  n={n} seed=42 months={months} ===")
    print("Assumptions:", {k: A[k] for k in ("bull", "chop", "bear", "risk_frac", "floor_dd")})
    results = {}
    for arm in ("PLAN", "DCA_QQQ", "SAT_ONLY"):
        rng = random.Random(42)                     # same market paths per arm
        snaps, dds, floors = {h: [] for h in horizons}, [], []
        for _ in range(n):
            s, dd, fh = sim(rng, months, arm)
            for h in horizons: snaps[h].append(s[h])
            dds.append(dd); floors.append(fh)
        results[arm] = (snaps, dds, floors)
        print(f"\n--- {arm} ---")
        for h in horizons:
            xs = snaps[h]
            print(f"  {h:>3}mo (contrib ${contrib[h]:>7,.0f}): "
                  f"median ${statistics.median(xs):>9,.0f}  "
                  f"p5 ${pct(xs,5):>9,.0f}  p25 ${pct(xs,25):>9,.0f}  "
                  f"p75 ${pct(xs,75):>9,.0f}  p95 ${pct(xs,95):>9,.0f}")
        print(f"  MaxDD(unit-NAV): median {statistics.median(dds):.1%}  "
              f"p95 {pct(dds,95):.1%}  worst {max(dds):.1%}")
        print(f"  Floor hits/sim: mean {statistics.mean(floors):.2f}  "
              f"P(>=1 floor hit) {sum(1 for f in floors if f>0)/n:.1%}")
    # head-to-head on identical seeds
    print("\n--- PLAN vs benchmarks (same market paths) ---")
    for h in horizons:
        p, q, s = results["PLAN"][0][h], results["DCA_QQQ"][0][h], results["SAT_ONLY"][0][h]
        beat_q = sum(1 for a, b in zip(p, q) if a > b) / n
        beat_s = sum(1 for a, b in zip(p, s) if a > b) / n
        print(f"  {h:>3}mo: P(PLAN>DCA_QQQ) {beat_q:.1%}  "
              f"median edge ${statistics.median(a-b for a,b in zip(p,q)):>7,.0f}   "
              f"P(PLAN>SAT_ONLY) {beat_s:.1%}")
    print("\nNOT PREDICTIONS. Rule-skeleton simulation under printed assumptions;")
    print("satellite expectancy (+0.41R/trade) is ASSUMED, not proven — the live")
    print("track record decides whether the satellite survives (LONG_TERM_PLAN §5).")

if __name__ == "__main__":
    main()
