import { NextRequest, NextResponse } from "next/server";
import { COOKIE, checkCode, fail, isAdmin, makeToken, reset, tooMany } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ admin: isAdmin() });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!process.env.ADMIN_CODE) {
    return NextResponse.json({ error: "ADMIN_CODE n'est pas défini sur le serveur." }, { status: 500 });
  }
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans 10 minutes." }, { status: 429 });
  }
  const { code } = await req.json().catch(() => ({ code: "" }));
  if (!checkCode(String(code ?? ""))) {
    fail(ip);
    return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
  }
  reset(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
