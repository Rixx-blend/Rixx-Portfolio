import { upload } from "@vercel/blob/client";

const clean = (n: string) => n.replace(/[^a-zA-Z0-9._-]/g, "_");

// Envoi direct vers Vercel Blob ; repli sur le disque local en développement.
export async function uploadFile(file: File): Promise<string> {
  try {
    const blob = await upload(`rixx/${Date.now()}-${clean(file.name)}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      multipart: file.size > 20 * 1024 * 1024,
    });
    return blob.url;
  } catch (e: any) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload-local", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error("Upload impossible. Ajoute Vercel Blob au projet (variable BLOB_READ_WRITE_TOKEN). " + (e?.message ?? ""));
    }
    return j.url as string;
  }
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
