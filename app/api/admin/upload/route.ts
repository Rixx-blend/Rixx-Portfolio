import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Fichier manquant" }, { status: 400 });

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`photos/${Date.now()}-${safe}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return Response.json({ src: blob.url });
}
