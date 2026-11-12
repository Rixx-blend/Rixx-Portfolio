import GalleryFlow from "@/components/GalleryFlow";
import "@/components/GalleryFlow.css";
import { getGallery } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { photos } = await getGallery();
  return (
    <>
      <GalleryFlow photos={photos} />
      <section className="gf-contact">
        <h2>Tu as un projet ?</h2>
        <p>Parlons-en</p>
      </section>
    </>
  );
}
