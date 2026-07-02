# IMPROVEMENT BACKLOG
Pipeline: idea → here → (testing where applicable) → Art V → CHANGELOG.
Max 2 adoptions/quarter. Rejected items keep their reasons.

| ID | Date | Source | Proposal | Expected effect (measurable) | Status |
|---|---|---|---|---|---|
| IB-1 | 2026-06-12 | v2 audit P0 | git init + remote + per-run commits | tamper-evident audit trail; restore drill possible | **DONE** (git baseline bf82b72; remote = user step in README) |
| IB-2 | 2026-06-12 | v2 audit P0 | tools/guard.py deterministic pre-trade validator | 100% of money-math out of prose; red-team families 1/7/8 caught by code | **DONE** (15 guard tests green) |
| IB-3 | 2026-06-12 | v2 audit P0 | flows.csv + TWR accounting | deposit-proof HWM/gates | **DONE** (state/flows.csv + tools/metrics.py TWR; deposit-not-gain test green) |
| IB-4 | 2026-06-12 | v2 audit P0 | run lock (single-writer) | duplicate-session order risk → 0 | **DONE** (tools/runlock.py + tests) |
| IB-5 | 2026-06-12 | v5 architecture review R1 | tools/regime.py (SMA/RV percentile) | regime classification deterministic; removes estimated vol axis | **DONE** (tools/regime.py + tests) |
| IB-6 | 2026-06-12 | v5 R8 / eval engine | tools/metrics.py (metric pack from CSVs) | metrics computed, not narrated | **DONE** (Python + lib/metrics.ts mirror) |
| IB-7 | 2026-06-12 | governance hardening §3 | override budget + benchmark rolling window + zombie-band gates (Art V P1 set) | closes the 7 indefinite-failure paths | proposed (needs user approval) |
| IB-8 | 2026-06-12 | v6 directive | implement command-center (scaffold Next.js app per command-center/ specs; deploy to Vercel) | operator approval workflow + audit UI live; dashboard becomes daily interface | **BUILT** (command-center/web; 13 pages + 18 API routes; build green; operator-consent loop verified vs Docker Postgres). Remaining = user deploy: Neon + Vercel + secrets (README) |
| IB-9 | 2026-07-02 | v7 CIO mandate | command-center dashboard gap panels: economic calendar, upcoming-earnings view, watchlist page (from state/watchlist.md), research queue view, analyst-estimate trends | mandate's dashboard spec fully covered; research desk visible to operator | proposed (build after user deploys the existing app) |
| IB-10 | 2026-07-02 | v7 CIO mandate | portfolio-analytics tooling: extend tools/metrics.py with sector/concentration/correlation computations for PORTFOLIO_REVIEW §2–4 (currently manual with work shown) | portfolio-intelligence math out of prose, deterministic | proposed |
| IB-11 | 2026-07-02 | repo hygiene | duplicate "* 2.md/ts/json" files throughout repo (file-sync artifact, ~60 files) — dedupe after diff-verifying identical | clean tree; no stale-copy confusion | proposed (needs user OK — deletion) |
