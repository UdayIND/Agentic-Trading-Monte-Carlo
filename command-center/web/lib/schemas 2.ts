import { z } from "zod";

export const RunIn = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ADHOC"]),
  status: z.enum(["RUNNING", "COMPLETE", "FAILED", "MISSED", "HOLIDAY"]),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullish(),
  modelVersion: z.string(),
  gitCommit: z.string().nullish(),
  phase: z.string(),
  regime: z.string(),
});

export const EvidenceIn = z.object({
  claim: z.string().min(1),
  sourceName: z.string(),
  sourceTier: z.number().int().min(1).max(4),
  url: z.string().nullish(),
  publishedAt: z.string().datetime().nullish(),
  accessedAt: z.string().datetime(),
  confidence: z.enum(["corroborated", "single-source", "disputed"]),
});

const ORDER_PATH_KINDS = ["BULL", "BEAR", "RISK", "TRADE_PLAN", "QUALITY"] as const;

export const ArtifactIn = z.object({
  runId: z.string(),
  kind: z.enum(["INTEL_REPORT", "TOP_OPPS", "BULL", "BEAR", "RISK", "TRADE_PLAN", "QUALITY", "DECISION", "POST_MORTEM", "HANDOFF", "OTHER"]),
  path: z.string(),
  content: z.string(),
  frontmatter: z.record(z.unknown()).nullish(),
  sha256: z.string().length(64),
  prevHash: z.string().nullish(),
  version: z.number().int().min(1).default(1),
  evidence: z.array(EvidenceIn).default([]),
}).refine(
  (a) => !ORDER_PATH_KINDS.includes(a.kind as (typeof ORDER_PATH_KINDS)[number])
    || a.evidence.every((e) => e.sourceTier <= 3),
  { message: "tier-4 sources forbidden on order-path artifacts" },
);

export const DecisionIn = z.object({
  runId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  decision: z.enum(["BUY", "SELL", "HOLD", "DO_NOTHING"]),
  confidence: z.number().int().min(0).max(100),
  reasoning: z.string().min(1),
  risks: z.string().min(1),
  invalidation: z.string().min(1),
  horizon: z.string().min(1),
  tickers: z.array(z.string()).default([]),
});

export const OpportunityIn = z.object({
  ticker: z.string(),
  sector: z.string(),
  marketCapBand: z.string().default("large"),
  convictionPre: z.number().int().min(0).max(100),
  convictionPost: z.number().int().min(0).max(100).nullish(),
  components: z.record(z.unknown()),
  band: z.enum(["REJECT", "WATCH", "TRADABLE", "HIGH"]),
  playbook: z.string(),
  catalyst: z.string().nullish(),
  expectedR: z.number().nullish(),
  target: z.number().nullish(),
  stop: z.number().nullish(),
  inclusionReasons: z.string().min(1),
  exclusionReasons: z.string().min(1), // honesty rule: required even for rank 1
  status: z.enum(["SCORED", "NOMINATED", "KILLED", "PLANNED", "WATCHLISTED"]),
  tradeId: z.string().nullish(),
});

export const TradeIn = z.object({
  ticker: z.string(),
  thesis: z.string().min(1),
  playbook: z.string(),
  entryPlan: z.number().positive(),
  stop: z.number().positive(),
  target1: z.number().positive(),
  target2: z.number().positive().nullish(),
  exitLogic: z.string().min(1),
  holdingPeriodDays: z.number().int().positive(),
  shares: z.number().positive(),
  riskUsd: z.number().positive(),
  maxLossUsd: z.number().positive(),
  expectedRewardUsd: z.number().positive(),
  expectedR: z.number().positive(),
  planRunId: z.string(),
});

export const PositionIn = z.object({
  ticker: z.string(),
  shares: z.number(),
  costBasis: z.number(),
  price: z.number(),
  plUsd: z.number(),
  stop: z.number().nullish(),
  target: z.number().nullish(),
  conviction: z.number().int().nullish(),
  whyWeStillOwnThis: z.string().min(1),
  tradeId: z.string().nullish(),
});

export const PositionsIn = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  positions: z.array(PositionIn),
  equityPoint: z.object({
    equity: z.number(), cash: z.number(), heatPct: z.number(),
    regime: z.string(), qqqClose: z.number().nullish(),
  }),
});

export const SignalIn = z.object({
  observedAt: z.string().datetime(),
  eventAt: z.string().datetime(),
  sourceClass: z.enum(["INSIDER", "CONGRESS", "INSTITUTIONAL"]),
  actor: z.string(),
  ticker: z.string(),
  txType: z.string(),
  sizeUsd: z.number().nullish(),
  priceAtObservation: z.number().nullish(),
  verified: z.boolean(),
  cfs: z.number().int().nullish(),
});

export const AgentRunIn = z.object({
  role: z.string(),
  pass: z.enum(["primary", "critic", "final"]),
  criticMode: z.string().nullish(),
  verdict: z.string().nullish(),
  confidence: z.number().int().nullish(),
  disagreements: z.array(z.string()).nullish(),
  vetoes: z.array(z.string()).nullish(),
  artifactId: z.string().nullish(),
});

export const TradeEventIn = z.object({
  tradeId: z.string(),
  type: z.enum(["IDEA", "CRITIC_PASS", "RISK_PASS", "QUALITY_PASS", "SUBMITTED", "APPROVED", "REJECTED", "CHALLENGED", "VERIFIED", "EXECUTED", "PARTIAL_FILL", "STOP_SET", "MODIFIED", "STOPPED_OUT", "TARGET_HIT", "CLOSED", "POST_MORTEM", "EXPIRED"]),
  payload: z.record(z.unknown()).nullish(),
  // status transition the agent asserts (server validates legality)
  newStatus: z.enum(["IDEA", "PLANNED", "PENDING_APPROVAL", "APPROVED", "REJECTED", "EXECUTED", "OPEN", "CLOSED", "CANCELLED", "EXPIRED"]).nullish(),
  realizedR: z.number().nullish(),
  realizedUsd: z.number().nullish(),
  closeReason: z.string().nullish(),
});

export const LessonIn = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string(),
  count: z.number().int().min(1),
  status: z.string(),
  evidence: z.array(z.string()).nullish(),
});

export const CalibrationIn = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  role: z.string(),
  claimId: z.string(),
  claimText: z.string(),
  confidence: z.number().int().min(0).max(100),
  resolvableBy: z.string().datetime().nullish(),
  resolvedAt: z.string().datetime().nullish(),
  outcome: z.boolean().nullish(),
});

// Legal trade state machine (DATABASE_SCHEMA integrity rule 2)
export const LEGAL_TRANSITIONS: Record<string, string[]> = {
  IDEA: ["PLANNED", "CANCELLED"],
  PLANNED: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["EXECUTED", "EXPIRED", "CANCELLED"],
  EXECUTED: ["OPEN"],
  OPEN: ["CLOSED"],
  REJECTED: [], CLOSED: [], CANCELLED: [], EXPIRED: ["PENDING_APPROVAL"],
};
