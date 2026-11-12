import { createHash } from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "gf_admin";

export function tokenFor(code: string): string {
  return createHash("sha256").update(`gf:${code}`).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const code = process.env.ADMIN_CODE;
  if (!code) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === tokenFor(code);
}
