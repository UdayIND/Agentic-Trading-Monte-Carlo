# IMPROVEMENT BACKLOG
Pipeline: idea → here → (testing where applicable) → Art V → CHANGELOG.
Max 2 adoptions/quarter. Rejected items keep their reasons.

| ID | Date | Source | Proposal | Expected effect (measurable) | Status |
|---|---|---|---|---|---|
| IB-1 | 2026-06-12 | v2 audit P0 | git init + remote + per-run commits | tamper-evident audit trail; restore drill possible | proposed (P0, blocks live) |
| IB-2 | 2026-06-12 | v2 audit P0 | tools/guard.py deterministic pre-trade validator | 100% of money-math out of prose; red-team families 1/7/8 caught by code | proposed (P0, blocks live) |
| IB-3 | 2026-06-12 | v2 audit P0 | flows.csv + TWR accounting | deposit-proof HWM/gates | proposed (P0, blocks live) |
| IB-4 | 2026-06-12 | v2 audit P0 | run lock (single-writer) | duplicate-session order risk → 0 | proposed (P0, blocks live) |
| IB-5 | 2026-06-12 | v5 architecture review R1 | tools/regime.py (SMA/RV percentile) | regime classification deterministic; removes estimated vol axis | proposed |
| IB-6 | 2026-06-12 | v5 R8 / eval engine | tools/metrics.py (metric pack from CSVs) | metrics computed, not narrated | proposed |
| IB-7 | 2026-06-12 | governance hardening §3 | override budget + benchmark rolling window + zombie-band gates (Art V P1 set) | closes the 7 indefinite-failure paths | proposed (needs user approval) |
| IB-8 | 2026-06-12 | v6 directive | implement command-center (scaffold Next.js app per command-center/ specs; deploy to Vercel) | operator approval workflow + audit UI live; dashboard becomes daily interface | proposed (design complete) |
