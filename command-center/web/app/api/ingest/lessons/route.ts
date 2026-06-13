import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ingestBody, ok } from "@/lib/api";
import { LessonIn } from "@/lib/schemas";

export const runtime = "nodejs";

const Body = z.object({ rows: z.array(LessonIn) });

export async function POST(req: NextRequest) {
  const r = await ingestBody(req, Body);
  if (!r.ok) return r.res;
  for (const l of r.data.rows) {
    await db.lesson.upsert({
      where: { id: l.id },
      create: { id: l.id, text: l.text, category: l.category, count: l.count, status: l.status, evidence: (l.evidence ?? undefined) as Prisma.InputJsonValue | undefined },
      update: { text: l.text, category: l.category, count: l.count, status: l.status, evidence: (l.evidence ?? undefined) as Prisma.InputJsonValue | undefined },
    });
  }
  return ok({ count: r.data.rows.length });
}
