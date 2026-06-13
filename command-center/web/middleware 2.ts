import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// All pages behind operator auth EXCEPT /login and the machine endpoints
// (which carry their own HMAC/Bearer auth inside the route handlers).
const PUBLIC = ["/login"];
// auth endpoints + machine endpoints carry their own auth inside the handler
const MACHINE_PREFIXES = ["/api/ingest", "/api/agent", "/api/cron", "/api/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname) || MACHINE_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
