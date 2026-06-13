// Single-operator session auth. MVP: strong password -> HMAC-signed expiry
// cookie. Passkey/TOTP upgrade path documented in README. Web Crypto only,
// so this works in both Edge middleware and Node route handlers.

const SESSION_COOKIE = "cc_session";
const SESSION_HOURS = 24;

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const sig = await hmacHex(process.env.SESSION_SECRET!, String(exp));
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  if (Number(expStr) < Date.now()) return false;
  const expect = await hmacHex(process.env.SESSION_SECRET, expStr);
  if (sig.length !== expect.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expect.charCodeAt(i);
  return diff === 0;
}

export { SESSION_COOKIE };
