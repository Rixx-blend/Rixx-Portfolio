import GalleryFlow from "@/components/GalleryFlow";
import "@/components/GalleryFlow.css";

// Ajoute tes photos dans public/photos/ et renseigne-les ici.
const photos: { id: string; src: string; alt: string }[] = [];

export default function Home() {
  return <GalleryFlow photos={photos} />;
}
