import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const db = new PrismaClient();
const ROOT = join(import.meta.dirname, "..", "..", "..");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const read = (p: string) => { try { return readFileSync(join(ROOT, p), "utf8"); } catch { return `_(file not found: ${p})_`; } };

async function main() {
  // --- The real 2026-06-12 run -------------------------------------------
  const run = await db.run.upsert({
    where: { date_type: { date: new Date("2026-06-12"), type: "DAILY" } },
    update: {},
    create: {
      date: new Date("2026-06-12"), type: "DAILY", status: "COMPLETE",
      startedAt: new Date("2026-06-12T23:30:00Z"), finishedAt: new Date("2026-06-12T23:45:00Z"),
      modelVersion: "claude-fable-5", gitCommit: "adb9d86", phase: "1_paper", regime: "BULL_VOLATILE",
    },
  });

  const intel = read("runs/2026-06-12/MARKET_INTELLIGENCE_REPORT.md");
  await db.artifact.upsert({
    where: { runId_kind_path_version: { runId: run.id, kind: "INTEL_REPORT", path: "runs/2026-06-12/MARKET_INTELLIGENCE_REPORT.md", version: 1 } },
    update: {},
    create: {
      runId: run.id, kind: "INTEL_REPORT", path: "runs/2026-06-12/MARKET_INTELLIGENCE_REPORT.md",
      content: intel, sha256: sha(intel),
      evidence: { create: [
        { claim: "FOMC Jun 16-17 with SEP/dot plot — no-entry days", sourceName: "federalreserve.gov", sourceTier: 1, url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", publishedAt: new Date("2026-06-10"), accessedAt: new Date("2026-06-12"), confidence: "corroborated" },
        { claim: "Nasdaq fell ~7% peak-to-trough Jun 2-10 on hot labor data + Israel-Iran strikes", sourceName: "CNBC", sourceTier: 2, url: "https://www.cnbc.com/2026/06/09/", publishedAt: new Date("2026-06-09"), accessedAt: new Date("2026-06-12"), confidence: "corroborated" },
      ] },
    },
  });

  const decisionMd = read("runs/2026-06-12/DECISION.md");
  await db.artifact.upsert({
    where: { runId_kind_path_version: { runId: run.id, kind: "DECISION", path: "runs/2026-06-12/DECISION.md", version: 1 } },
    update: {}, create: { runId: run.id, kind: "DECISION", path: "runs/2026-06-12/DECISION.md", content: decisionMd, sha256: sha(decisionMd) },
  });

  await db.decision.upsert({
    where: { runId: run.id }, update: {},
    create: {
      runId: run.id, date: new Date("2026-06-12"), decision: "DO_NOTHING", confidence: 95,
      reasoning: "Market closed; account $0 pending deposit; Phase 1 paper; FOMC Tue-Wed are no-entry days; recovery less evidenced than selloff. Inaction overdetermined.",
      risks: "Missing first two days of a confirmed post-FOMC trend resumption. Accepted — missing upside is recoverable.",
      invalidation: "Deposit lands + P0 built + paper gate running. QQQ close <693 post-FOMC = bear watch; two quiet weeks = restore BULL_QUIET.",
      horizon: "Next session Mon 2026-06-15 (paper).", tickers: [],
    },
  });

  await db.calibrationClaim.upsert({
    where: { claimId: "DEC-2026-06-12" }, update: {},
    create: { date: new Date("2026-06-12"), role: "session_decision", claimId: "DEC-2026-06-12",
      claimText: "DO_NOTHING was the correct call", confidence: 95, resolvableBy: new Date("2026-06-15") },
  });

  // a couple of agent passes for the /agents page
  await db.agentRun.createMany({ data: [
    { runId: run.id, role: "regime", pass: "primary", verdict: "BULL_VOLATILE", confidence: 70 },
    { runId: run.id, role: "macro", pass: "primary", verdict: "FOMC no-entry Jun16-17", confidence: 90 },
    { runId: run.id, role: "compliance", pass: "final", verdict: "PASS", confidence: 95, criticMode: "firewall" },
  ] });

  // equity point (paper, $0 pre-deposit shown as inception marker)
  await db.equityPoint.upsert({
    where: { date: new Date("2026-06-12") }, update: {},
    create: { date: new Date("2026-06-12"), equity: 1000, cash: 1000, heatPct: 0, regime: "BULL_VOLATILE", qqqClose: 721.37 },
  });

  // --- A DEMO pending-approval trade so the operator loop is testable -----
  // (clearly marked demo; the real system is flat in paper phase)
  const demoRun = await db.run.upsert({
    where: { date_type: { date: new Date("2026-06-15"), type: "DAILY" } },
    update: {},
    create: { date: new Date("2026-06-15"), type: "DAILY", status: "COMPLETE",
      startedAt: new Date("2026-06-15T13:00:00Z"), modelVersion: "claude-fable-5", phase: "1_paper", regime: "BULL_VOLATILE" },
  });
  const demoArts: [string, string][] = [
    ["BULL", "DEMO. NVDA reclaimed the 21-EMA on a pullback in an established uptrend; semis leading the recovery (SMH +1.65%). RS positive 1m/3m. Entry on reclaim of prior day high."],
    ["BEAR", "DEMO (fresh-context). FOMC dot plot is a binary two days out — any hawkish surprise hits NVDA hardest. Recovery is dip-buying, not confirmed trend. Crowded long. Conviction likely inflated on regime-alignment (BULL_VOLATILE only permits pullback at reduced size)."],
    ["RISK", "DEMO. Risk 1.0% ($10) per BULL_VOLATILE. Stop 2.5xATR. Heat after: 1.0% vs 2.0% cap PASS. Notional <30% PASS. Cash floor 25% PASS. Guard: PASS."],
    ["TRADE_PLAN", "DEMO. Entry 205.40 limit; stop 197.20; T1 221.8 (+2R, sell half, stop->BE); T2 trail 21-EMA; hold ~8d; 1 share; risk $8.20; max loss (gap) ~$41; expected R 2.6."],
    ["QUALITY", "DEMO. 6/6 CLEARED. Evidence tagged; no contradictions; quotes fresh; guard PASS; arithmetic reproduced."],
  ];
  for (const [kind, content] of demoArts) {
    await db.artifact.upsert({
      where: { runId_kind_path_version: { runId: demoRun.id, kind: kind as never, path: `runs/2026-06-15/${kind}_NVDA.md`, version: 1 } },
      update: {},
      create: { runId: demoRun.id, kind: kind as never, path: `runs/2026-06-15/${kind}_NVDA.md`, content, sha256: sha(content) },
    });
  }
  const existingDemo = await db.trade.findFirst({ where: { ticker: "NVDA", status: "PENDING_APPROVAL" } });
  if (!existingDemo) {
    await db.trade.create({
      data: {
        ticker: "NVDA", status: "PENDING_APPROVAL",
        thesis: "DEMO pullback long — reclaim of 21-EMA in uptrend, semis leadership.",
        playbook: "PB", entryPlan: 205.40, stop: 197.20, target1: 221.8, target2: null,
        exitLogic: "Partial at +2R then trail 21-EMA; time stop 10d; exit before earnings.",
        holdingPeriodDays: 8, shares: 1, riskUsd: 8.2, maxLossUsd: 41, expectedRewardUsd: 21.3, expectedR: 2.6,
        planRunId: demoRun.id,
        events: { create: [{ type: "IDEA" }, { type: "CRITIC_PASS", payload: { mode: "fresh-subagent", verdict: "REVISE->addressed", score: "84->81" } }, { type: "QUALITY_PASS" }, { type: "SUBMITTED" }] },
      },
    });
  }

  // --- A sample capital-flow signal + lesson for those pages --------------
  await db.capitalFlowSignal.upsert({
    where: { actor_ticker_eventAt_txType: { actor: "DEMO CEO", ticker: "XYZ", eventAt: new Date("2026-06-05"), txType: "P" } },
    update: {},
    create: { observedAt: new Date("2026-06-09"), eventAt: new Date("2026-06-05"), sourceClass: "INSIDER",
      actor: "DEMO CEO", ticker: "XYZ", txType: "P", sizeUsd: 1200000, priceAtObservation: 48.0, verified: true, cfs: 82 },
  });

  console.log("Seed complete: 2026-06-12 real run + demo pending NVDA trade + sample signal.");
}

main().then(() => db.$disconnect()).catch((e) => { console.error(e); db.$disconnect(); process.exit(1); });
