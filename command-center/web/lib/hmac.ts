// Ingest authentication: HMAC-SHA256 over `${timestamp}.${rawBody}` with
// INGEST_SECRET. Timestamp window ±5 min (replay protection). Node runtime.
import { createHmac, timingSafeEqual } from "node:crypto";

const WINDOW_MS = 5 * 60 * 1000;

export function verifyIngest(rawBody: string, signature: string | null, timestamp: string | null): { ok: boolean; error?: string } {
  const secret = process.env.INGEST_SECRET;
  if (!secret) return { ok: false, error: "server missing INGEST_SECRET" };
  if (!signature || !timestamp) return { ok: false, error: "missing signature headers" };
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > WINDOW_MS)
    return { ok: false, error: "timestamp outside window" };
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return { ok: false, error: "bad signature" };
  return { ok: true };
}

export function verifyBearer(header: string | null, envVar: "AGENT_TOKEN" | "CRON_SECRET"): boolean {
  const want = process.env[envVar];
  if (!want || !header) return false;
  const got = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
