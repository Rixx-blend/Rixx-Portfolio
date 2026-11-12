import GalleryFlow from "@/components/GalleryFlow";
import "@/components/GalleryFlow.css";

// Photos de référence (remplaçables) — fichiers dans public/photos/
// Renseigne le titre et le lieu affichés sous chaque carte.
const photos: { id: string; src: string; alt: string; title: string; place: string }[] =
  Array.from({ length: 12 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: n,
      src: `/photos/photo-${n}.jpg`,
      alt: `Photographie ${n}`,
      title: `Titre ${n}`,
      place: "Lieu",
    };
  });

export default function Home() {
  return <GalleryFlow photos={photos} />;
}
