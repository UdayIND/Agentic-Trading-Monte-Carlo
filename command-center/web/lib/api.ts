import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyIngest, verifyBearer } from "@/lib/hmac";

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data, requestId: crypto.randomUUID() }, { status });
}
export function err(error: string, status = 400) {
  return NextResponse.json({ ok: false, error, requestId: crypto.randomUUID() }, { status });
}

/** Read raw body, verify HMAC ingest signature, parse+validate with Zod.
 *  Uses z.infer<S> so .default()/.refine() OUTPUT types flow through. */
export async function ingestBody<S extends z.ZodTypeAny>(req: NextRequest, schema: S): Promise<
  { ok: true; data: z.infer<S> } | { ok: false; res: NextResponse }
> {
  const raw = await req.text();
  const v = verifyIngest(raw, req.headers.get("x-signature"), req.headers.get("x-timestamp"));
  if (!v.ok) return { ok: false, res: err(v.error ?? "unauthorized", 401) };
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return { ok: false, res: err("invalid JSON") }; }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, res: err(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 422) };
  return { ok: true, data: parsed.data };
}

export function requireAgent(req: NextRequest): NextResponse | null {
  return verifyBearer(req.headers.get("authorization"), "AGENT_TOKEN") ? null : err("agent unauthorized", 403);
}
export function requireCron(req: NextRequest): NextResponse | null {
  return verifyBearer(req.headers.get("authorization"), "CRON_SECRET") ? null : err("cron unauthorized", 403);
}
