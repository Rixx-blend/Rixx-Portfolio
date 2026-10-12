import { getDb, starFirst } from "@/lib/db";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ArcGallery } from "@/components/arc-gallery";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDb();
  const items = db.categories.map((c) => {
    const count =
      c.kind === "pdp" ? db.pdps.length : c.kind === "models" ? db.models.length : db.creations.filter((x) => x.categoryId === c.id).length;
    return {
      id: c.id,
      image: c.cover,
      title: c.name,
      subtitle: `À partir de ${c.from} € · ${count} création${count > 1 ? "s" : ""}`,
      href: `/${c.slug}`,
    };
  });
  void starFirst;
  return (
    <>
      <Navbar name={db.site.name} />
      <main>
        <Hero site={db.site} tools={db.tools} />
        <ArcGallery id="galerie" heading="Mes créations" items={items} />
        <Contact site={db.site} socials={db.socials} />
      </main>
      <Footer name={db.site.name} />
    </>
  );
}
