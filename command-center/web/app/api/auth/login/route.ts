import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err } from "@/lib/api";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ password: z.string() }).safeParse(body);
  if (!parsed.success) return err("password required", 400);

  const expected = process.env.OPERATOR_PASSWORD;
  if (!expected) return err("server not configured", 500);
  const a = Buffer.from(parsed.data.password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return err("invalid credentials", 401);

  const token = await createSessionToken();
  const res = ok({ authenticated: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 24 * 3600,
  });
  return res;
}
