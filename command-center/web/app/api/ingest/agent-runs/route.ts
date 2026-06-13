import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestBody, ok, err } from "@/lib/api";
import { AgentRunIn } from "@/lib/schemas";

export const runtime = "nodejs";

const Body = z.object({ runId: z.string(), rows: z.array(AgentRunIn) });

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, Body);
  if (!r.ok) return r.res;
  const { runId, rows } = r.data;
  if (!(await db.run.findUnique({ where: { id: runId } }))) return err("unknown runId", 404);
  await db.agentRun.deleteMany({ where: { runId } });
  await db.agentRun.createMany({
    data: rows.map((a) => ({
      runId, role: a.role, pass: a.pass, criticMode: a.criticMode ?? null,
      verdict: a.verdict ?? null, confidence: a.confidence ?? null,
      disagreements: (a.disagreements ?? undefined) as Prisma.InputJsonValue | undefined, vetoes: (a.vetoes ?? undefined) as Prisma.InputJsonValue | undefined,
      artifactId: a.artifactId ?? null,
    })),
  });
  return ok({ count: rows.length });
}
