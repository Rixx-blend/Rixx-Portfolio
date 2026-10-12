import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "rixx_admin";

function secret() {
  return `rixx::${process.env.ADMIN_CODE ?? ""}`;
}
export function makeToken(): string {
  return crypto.createHmac("sha256", secret()).update("admin-session").digest("hex");
}
export function checkCode(code: string): boolean {
  const expected = process.env.ADMIN_CODE;
  if (!expected || !code) return false;
  const a = crypto.createHash("sha256").update(code).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}
export function isAdmin(): boolean {
  if (!process.env.ADMIN_CODE) return false;
  const c = cookies().get(COOKIE)?.value;
  if (!c) return false;
  const t = makeToken();
  return c.length === t.length && crypto.timingSafeEqual(Buffer.from(c), Buffer.from(t));
}

// Anti brute-force simple (en mémoire, par instance)
const attempts = new Map<string, { n: number; t: number }>();
export function tooMany(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.t > 10 * 60_000) return false;
  return a.n >= 5;
}
export function fail(ip: string) {
  const now = Date.now();
  const a = attempts.get(ip);
  attempts.set(ip, !a || now - a.t > 10 * 60_000 ? { n: 1, t: now } : { n: a.n + 1, t: a.t });
}
export function reset(ip: string) {
  attempts.delete(ip);
}
