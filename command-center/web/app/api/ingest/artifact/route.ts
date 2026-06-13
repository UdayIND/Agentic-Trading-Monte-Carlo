import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestBody, ok, err } from "@/lib/api";
import { ArtifactIn } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, ArtifactIn);
  if (!r.ok) return r.res;
  const d = r.data;
  // server-side hash verification (tamper evidence)
  const actual = createHash("sha256").update(d.content).digest("hex");
  if (actual !== d.sha256) return err(`hash mismatch: body=${actual} claimed=${d.sha256}`, 422);

  const run = await db.run.findUnique({ where: { id: d.runId } });
  if (!run) return err("unknown runId", 404);

  const artifact = await db.artifact.upsert({
    where: { runId_kind_path_version: { runId: d.runId, kind: d.kind, path: d.path, version: d.version } },
    create: {
      runId: d.runId, kind: d.kind, path: d.path, content: d.content,
      frontmatter: (d.frontmatter ?? undefined) as Prisma.InputJsonValue | undefined, sha256: d.sha256, prevHash: d.prevHash ?? null, version: d.version,
      evidence: { create: d.evidence.map((e) => ({
        claim: e.claim, sourceName: e.sourceName, sourceTier: e.sourceTier,
        url: e.url ?? null, publishedAt: e.publishedAt ? new Date(e.publishedAt) : null,
        accessedAt: new Date(e.accessedAt), confidence: e.confidence,
      })) },
    },
    update: {}, // artifacts immutable: same key = no-op (re-ingest safe)
  });
  return ok({ artifactId: artifact.id });
}
