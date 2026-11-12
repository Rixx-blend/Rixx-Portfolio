import { COOKIE, tokenFor } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const code = process.env.ADMIN_CODE;
  if (!code) return Response.json({ error: "ADMIN_CODE non configuré" }, { status: 500 });

  const { code: given } = (await req.json().catch(() => ({}))) as { code?: string };
  if (given !== code) return Response.json({ error: "Code incorrect" }, { status: 401 });

  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=${tokenFor(code)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
  );
  return res;
}
