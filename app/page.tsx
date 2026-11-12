import GalleryFlow from "@/components/GalleryFlow";
import "@/components/GalleryFlow.css";
import { getGallery } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { photos } = await getGallery();
  return <GalleryFlow photos={photos} />;
}
