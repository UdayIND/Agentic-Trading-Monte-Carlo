# DATABASE SCHEMA (v6) — Prisma / PostgreSQL

Conventions: cuid ids · createdAt/updatedAt on all models · soft immutability
(no UPDATE on audit-class tables; versioned inserts) · all enums in code.

```prisma
// ---------- Pipeline & audit spine ----------
model Run {                       // one pipeline execution (daily session)
  id          String   @id @default(cuid())
  date        DateTime @db.Date
  type        RunType              // DAILY | WEEKLY | MONTHLY | QUARTERLY | ADHOC
  status      RunStatus            // RUNNING | COMPLETE | FAILED | MISSED
  startedAt   DateTime
  finishedAt  DateTime?
  modelVersion String              // e.g. claude-fable-5
  gitCommit   String?              // repo SHA containing the run's artifacts
  phase       String               // 1_paper | 2_live_half | 3_live_full
  regime      String
  artifacts   Artifact[]
  decision    Decision?
  agentRuns   AgentRun[]
  opportunities Opportunity[]
}

model Artifact {                  // every file the pipeline produced
  id        String  @id @default(cuid())
  runId     String
  kind      ArtifactKind          // INTEL_REPORT | TOP_OPPS | BULL | BEAR | RISK |
                                  // TRADE_PLAN | QUALITY | DECISION | POST_MORTEM | HANDOFF | OTHER
  path      String                // repo path (ground truth)
  content   String  @db.Text
  frontmatter Json?
  sha256    String
  prevHash  String?               // hash chain within run (tamper evidence)
  version   Int     @default(1)   // corrections = new version, old kept
  evidence  EvidenceBlock[]
  run       Run @relation(...)
  @@unique([runId, kind, version, path])
}

model EvidenceBlock {             // quarantined web/tool evidence (v5 schema)
  id          String @id @default(cuid())
  artifactId  String
  claim       String
  sourceName  String
  sourceTier  Int                  // 1..4
  url         String?
  publishedAt DateTime?
  accessedAt  DateTime
  confidence  String               // corroborated | single-source | disputed
}

model Decision {                  // Section 1: today's decision (one per run)
  id          String  @id @default(cuid())
  runId       String  @unique
  date        DateTime @db.Date
  decision    DecisionType         // BUY | SELL | HOLD | DO_NOTHING
  confidence  Int
  reasoning   String  @db.Text
  risks       String  @db.Text
  invalidation String @db.Text
  horizon     String
  tickers     String[]
}

// ---------- Opportunities & trades ----------
model Opportunity {               // Section 3 rows (per run, incl. rejects)
  id           String @id @default(cuid())
  runId        String
  ticker       String
  sector       String
  marketCapBand String            // mega | large | mid (filterable)
  convictionPre  Int
  convictionPost Int?
  components   Json               // 10 components + CF modifier w/ evidence
  band         Band               // REJECT | WATCH | TRADABLE | HIGH
  playbook     String
  catalyst     String?
  expectedR    Decimal?
  target       Decimal?
  stop         Decimal?
  inclusionReasons String @db.Text
  exclusionReasons String @db.Text
  status       OppStatus          // SCORED | NOMINATED | KILLED | PLANNED | WATCHLISTED
  tradeId      String?
}

model Trade {                     // Section 4: full lifecycle
  id        String @id @default(cuid())
  ticker    String
  status    TradeStatus           // IDEA | PLANNED | PENDING_APPROVAL | APPROVED |
                                  // REJECTED | EXECUTED | OPEN | CLOSED | CANCELLED
  thesis    String  @db.Text
  playbook  String
  entryPlan Decimal
  stop      Decimal
  target1   Decimal
  target2   Decimal?
  exitLogic String
  holdingPeriodDays Int
  shares    Decimal
  riskUsd   Decimal
  maxLossUsd Decimal              // gap-case
  expectedRewardUsd Decimal
  expectedR Decimal
  realizedR Decimal?
  realizedUsd Decimal?
  openedAt  DateTime?
  closedAt  DateTime?
  closeReason String?
  events    TradeEvent[]
  approvals OperatorAction[]
  planArtifactId String           // links to TRADE_PLAN artifact (and via run → bull/bear/risk/quality)
}

model TradeEvent {                // Section 4 timeline (append-only)
  id      String @id @default(cuid())
  tradeId String
  type    TradeEventType          // IDEA | CRITIC_PASS | RISK_PASS | QUALITY_PASS |
                                  // SUBMITTED | APPROVED | REJECTED | CHALLENGED |
                                  // VERIFIED | EXECUTED | PARTIAL_FILL | STOP_SET |
                                  // MODIFIED | STOPPED_OUT | TARGET_HIT | CLOSED | POST_MORTEM
  at      DateTime
  payload Json                    // fills, prices, ref_ids, artifact links
}

model OperatorAction {            // Section 14: the consent ledger (append-only)
  id      String @id @default(cuid())
  tradeId String?
  kind    OperatorActionKind      // APPROVE | REJECT | CHALLENGE | NOTE | OVERRIDE | HALT_ACK
  note    String? @db.Text
  at      DateTime @default(now())
  // identity is implicit: single authenticated operator; session id logged
}

// ---------- Portfolio & performance ----------
model PositionSnapshot {          // daily, from agent ingest (broker = truth)
  id        String @id @default(cuid())
  date      DateTime @db.Date
  ticker    String
  shares    Decimal
  costBasis Decimal
  price     Decimal
  plUsd     Decimal
  stop      Decimal?
  target    Decimal?
  conviction Int?
  whyWeStillOwnThis String @db.Text   // Section 5 daily requirement
  tradeId   String?
  @@unique([date, ticker])
}

model EquityPoint {               // mirrors state/equity_curve.csv
  date    DateTime @id @db.Date
  equity  Decimal
  cash    Decimal
  heatPct Decimal
  regime  String
  qqqClose Decimal?               // benchmark column for charts
}

model MetricSnapshot {            // computed by platform code (deterministic)
  id     String @id @default(cuid())
  asOf   DateTime @db.Date
  window String                   // MTD | QTD | YTD | ROLL12M | INCEPTION
  cagr   Decimal?  sharpe Decimal?  sortino Decimal?
  profitFactor Decimal?  expectancyR Decimal?  winRate Decimal?
  alpha  Decimal?  beta Decimal?   maxDrawdown Decimal?
  exposurePct Decimal?  trades Int
  @@unique([asOf, window])
}

// ---------- Intelligence & signals ----------
model CapitalFlowSignal {         // mirrors capital_flow_signals.csv + scoring
  id        String @id @default(cuid())
  observedAt DateTime
  eventAt   DateTime
  sourceClass String              // INSIDER | CONGRESS | INSTITUTIONAL
  actor     String
  ticker    String
  txType    String                // P | S | S_10b5 | M | 13D | 13F_NEW | ...
  sizeUsd   Decimal?
  priceAtObservation Decimal?
  verified  Boolean
  cfs       Int?                  // capital-flow score when computed
  fwdExcess3m Decimal?  fwdExcess6m Decimal?  fwdExcess12m Decimal?  // validation
  @@unique([actor, ticker, eventAt, txType])   // duplicate detection
}

model Lesson {                    // Section 7 (mirrors LESSONS_LEARNED.md)
  id        String @id @default(cuid())
  text      String
  category  String                // mistake | failure-theme | winning-pattern | losing-pattern
  count     Int      @default(1)
  status    String                // active | escalated | rule-adopted | archived
  evidence  Json                  // post-mortem artifact ids
}

// ---------- AI accountability ----------
model AgentRun {                  // Section 9: per role, per pass
  id        String @id @default(cuid())
  runId     String
  role      String                // regime | macro | technical | capital_flow | risk |
                                  // portfolio | execution | compliance | evaluator
  pass      String                // primary | critic | final
  criticMode String?              // fresh-subagent | firewall
  verdict   String?               // KILL | REVISE | SURVIVES | PASS | VETO | ...
  confidence Int?
  disagreements Json?             // items raised vs other roles
  vetoes    Json?
  artifactId String?
}

model CalibrationClaim {          // Section 12: confidence vs reality
  id          String @id @default(cuid())
  date        DateTime @db.Date
  role        String
  claimId     String  @unique
  claimText   String
  confidence  Int
  resolvableBy DateTime?
  resolvedAt  DateTime?
  outcome     Boolean?            // true = claim held
}

model QualityBlockEvent {         // gate telemetry
  id String @id @default(cuid())
  date DateTime  subject String  check Int  artifactId String?  producerRole String
}

model SystemEvent {               // halts, breaker, reconcile results, alerts
  id String @id @default(cuid())
  at DateTime @default(now())
  kind String                     // INGEST_MISSED | RECONCILE_MISMATCH | BREAKER | HARD_FLOOR | ...
  severity String                 // info | warn | critical
  payload Json
  acknowledgedAt DateTime?        // operator ack (HALT_ACK writes here too)
}
```

## Integrity Rules
1. Append-only (Postgres trigger rejects UPDATE/DELETE): Artifact,
   TradeEvent, OperatorAction, Decision, CalibrationClaim, SystemEvent.
2. Trade.status transitions enforced in code against the legal state
   machine (IDEA→…→CLOSED); illegal transition = 409 + SystemEvent.
3. Every Trade must reference artifacts of kinds BULL, BEAR, RISK,
   TRADE_PLAN, QUALITY before it may enter PENDING_APPROVAL (DB-level check
   via service layer).
4. Metrics are computed from EquityPoint + Trade rows by TypeScript code —
   never ingested from LLM prose.
