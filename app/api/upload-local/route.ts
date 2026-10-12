import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Repli pour le développement local uniquement (sans Vercel Blob).
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (process.env.VERCEL) return NextResponse.json({ error: "Utilise Vercel Blob en production." }, { status: 501 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${safe}` });
}
