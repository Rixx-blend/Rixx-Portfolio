import GalleryFlow from "@/components/GalleryFlow";
import "@/components/GalleryFlow.css";

// Photos de référence (remplaçables) — fichiers dans public/photos/
const photos: { id: string; src: string; alt: string }[] = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: n, src: `/photos/photo-${n}.jpg`, alt: `Photographie ${n}` };
});

export default function Home() {
  return <GalleryFlow photos={photos} />;
}
