-- CreateEnum
CREATE TYPE "RunType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ADHOC');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('RUNNING', 'COMPLETE', 'FAILED', 'MISSED', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "ArtifactKind" AS ENUM ('INTEL_REPORT', 'TOP_OPPS', 'BULL', 'BEAR', 'RISK', 'TRADE_PLAN', 'QUALITY', 'DECISION', 'POST_MORTEM', 'HANDOFF', 'OTHER');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('BUY', 'SELL', 'HOLD', 'DO_NOTHING');

-- CreateEnum
CREATE TYPE "Band" AS ENUM ('REJECT', 'WATCH', 'TRADABLE', 'HIGH');

-- CreateEnum
CREATE TYPE "OppStatus" AS ENUM ('SCORED', 'NOMINATED', 'KILLED', 'PLANNED', 'WATCHLISTED');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('IDEA', 'PLANNED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED', 'OPEN', 'CLOSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TradeEventType" AS ENUM ('IDEA', 'CRITIC_PASS', 'RISK_PASS', 'QUALITY_PASS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CHALLENGED', 'VERIFIED', 'EXECUTED', 'PARTIAL_FILL', 'STOP_SET', 'MODIFIED', 'STOPPED_OUT', 'TARGET_HIT', 'CLOSED', 'POST_MORTEM', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OperatorActionKind" AS ENUM ('APPROVE', 'REJECT', 'CHALLENGE', 'NOTE', 'OVERRIDE', 'HALT_ACK');

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "RunType" NOT NULL,
    "status" "RunStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "modelVersion" TEXT NOT NULL,
    "gitCommit" TEXT,
    "phase" TEXT NOT NULL,
    "regime" TEXT NOT NULL,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kind" "ArtifactKind" NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "frontmatter" JSONB,
    "sha256" TEXT NOT NULL,
    "prevHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceBlock" (
    "id" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceTier" INTEGER NOT NULL,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3) NOT NULL,
    "confidence" TEXT NOT NULL,

    CONSTRAINT "EvidenceBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "invalidation" TEXT NOT NULL,
    "horizon" TEXT NOT NULL,
    "tickers" TEXT[],

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "marketCapBand" TEXT NOT NULL DEFAULT 'large',
    "convictionPre" INTEGER NOT NULL,
    "convictionPost" INTEGER,
    "components" JSONB NOT NULL,
    "band" "Band" NOT NULL,
    "playbook" TEXT NOT NULL,
    "catalyst" TEXT,
    "expectedR" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "stop" DOUBLE PRECISION,
    "inclusionReasons" TEXT NOT NULL,
    "exclusionReasons" TEXT NOT NULL,
    "status" "OppStatus" NOT NULL,
    "tradeId" TEXT,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "thesis" TEXT NOT NULL,
    "playbook" TEXT NOT NULL,
    "entryPlan" DOUBLE PRECISION NOT NULL,
    "stop" DOUBLE PRECISION NOT NULL,
    "target1" DOUBLE PRECISION NOT NULL,
    "target2" DOUBLE PRECISION,
    "exitLogic" TEXT NOT NULL,
    "holdingPeriodDays" INTEGER NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "riskUsd" DOUBLE PRECISION NOT NULL,
    "maxLossUsd" DOUBLE PRECISION NOT NULL,
    "expectedRewardUsd" DOUBLE PRECISION NOT NULL,
    "expectedR" DOUBLE PRECISION NOT NULL,
    "realizedR" DOUBLE PRECISION,
    "realizedUsd" DOUBLE PRECISION,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closeReason" TEXT,
    "planRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeEvent" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "type" "TradeEventType" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,

    CONSTRAINT "TradeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorAction" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT,
    "kind" "OperatorActionKind" NOT NULL,
    "note" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionSnapshot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "ticker" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "costBasis" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "plUsd" DOUBLE PRECISION NOT NULL,
    "stop" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "conviction" INTEGER,
    "whyWeStillOwnThis" TEXT NOT NULL,
    "tradeId" TEXT,

    CONSTRAINT "PositionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquityPoint" (
    "date" DATE NOT NULL,
    "equity" DOUBLE PRECISION NOT NULL,
    "cash" DOUBLE PRECISION NOT NULL,
    "heatPct" DOUBLE PRECISION NOT NULL,
    "regime" TEXT NOT NULL,
    "qqqClose" DOUBLE PRECISION,

    CONSTRAINT "EquityPoint_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL,
    "asOf" DATE NOT NULL,
    "window" TEXT NOT NULL,
    "cagr" DOUBLE PRECISION,
    "sharpe" DOUBLE PRECISION,
    "sortino" DOUBLE PRECISION,
    "profitFactor" DOUBLE PRECISION,
    "expectancyR" DOUBLE PRECISION,
    "winRate" DOUBLE PRECISION,
    "alpha" DOUBLE PRECISION,
    "beta" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION,
    "exposurePct" DOUBLE PRECISION,
    "trades" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalFlowSignal" (
    "id" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "eventAt" TIMESTAMP(3) NOT NULL,
    "sourceClass" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "txType" TEXT NOT NULL,
    "sizeUsd" DOUBLE PRECISION,
    "priceAtObservation" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL,
    "cfs" INTEGER,
    "fwdExcess3m" DOUBLE PRECISION,
    "fwdExcess6m" DOUBLE PRECISION,
    "fwdExcess12m" DOUBLE PRECISION,

    CONSTRAINT "CapitalFlowSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "evidence" JSONB,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "pass" TEXT NOT NULL,
    "criticMode" TEXT,
    "verdict" TEXT,
    "confidence" INTEGER,
    "disagreements" JSONB,
    "vetoes" JSONB,
    "artifactId" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationClaim" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "role" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "resolvableBy" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "outcome" BOOLEAN,

    CONSTRAINT "CalibrationClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityBlockEvent" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "check" INTEGER NOT NULL,
    "artifactId" TEXT,
    "producerRole" TEXT NOT NULL,

    CONSTRAINT "QualityBlockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "payload" JSONB,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Run_date_type_key" ON "Run"("date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_runId_kind_path_version_key" ON "Artifact"("runId", "kind", "path", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_runId_key" ON "Decision"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "PositionSnapshot_date_ticker_key" ON "PositionSnapshot"("date", "ticker");

-- CreateIndex
CREATE UNIQUE INDEX "MetricSnapshot_asOf_window_key" ON "MetricSnapshot"("asOf", "window");

-- CreateIndex
CREATE UNIQUE INDEX "CapitalFlowSignal_actor_ticker_eventAt_txType_key" ON "CapitalFlowSignal"("actor", "ticker", "eventAt", "txType");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationClaim_claimId_key" ON "CalibrationClaim"("claimId");

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceBlock" ADD CONSTRAINT "EvidenceBlock_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeEvent" ADD CONSTRAINT "TradeEvent_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorAction" ADD CONSTRAINT "OperatorAction_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
