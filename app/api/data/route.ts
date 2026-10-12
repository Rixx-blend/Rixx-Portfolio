import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import type { Db } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDb());
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Db | null;
  const ok =
    body &&
    body.site &&
    ["tools", "categories", "creations", "pdps", "models", "socials"].every((k) => Array.isArray((body as any)[k]));
  if (!ok) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  try {
    await saveDb(body);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Échec de l'enregistrement." }, { status: 500 });
  }
}
