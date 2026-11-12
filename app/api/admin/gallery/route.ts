import { isAdmin } from "@/lib/admin-auth";
import { getGallery, saveGallery, type Gallery } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });
  return Response.json(await getGallery());
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const data = (await req.json()) as Gallery;
  if (!Array.isArray(data?.photos)) return Response.json({ error: "Données invalides" }, { status: 400 });
  await saveGallery(data);
  return Response.json({ ok: true });
}
