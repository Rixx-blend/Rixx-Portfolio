import { list, put } from "@vercel/blob";

export type Photo = {
  id: string;
  src: string;
  alt: string;
  title: string;
  place: string;
};

export type Gallery = { photos: Photo[] };

const FILE = "gallery.json";

// Contenu de départ, utilisé tant qu'aucune donnée n'a été enregistrée depuis l'admin
export const DEFAULT_GALLERY: Gallery = {
  photos: Array.from({ length: 12 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: n,
      src: `/photos/photo-${n}.jpg`,
      alt: `Photographie ${n}`,
      title: `Titre ${n}`,
      place: "Lieu",
    };
  }),
};

export async function getGallery(): Promise<Gallery> {
  try {
    const { blobs } = await list({ prefix: FILE, limit: 5 });
    const blob = blobs.find((b) => b.pathname === FILE);
    if (!blob) return DEFAULT_GALLERY;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_GALLERY;
    return (await res.json()) as Gallery;
  } catch {
    return DEFAULT_GALLERY;
  }
}

export async function saveGallery(data: Gallery): Promise<void> {
  await put(FILE, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
