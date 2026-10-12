import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDb, starFirst } from "../../lib/db";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { CreationsArc } from "../../components/creations-arc";
import { PdpCarousel } from "../../components/pdp-carousel";
import { ModelsGrid } from "../../components/models-grid";
import { Reveal } from "../../components/reveal";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { categorie: string } }) {
  const db = await getDb();
  const cat = db.categories.find((c) => c.slug === params.categorie);
  if (!cat) notFound();

  return (
    <>
      <Navbar name={db.site.name} />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-6xl px-5 pb-10">
          <Link href="/#galerie" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft size={16} /> Retour
          </Link>
          <Reveal>
            <h1 className="title-lg">{cat.name}</h1>
            <p className="mt-3 text-muted">À partir de {cat.from} €</p>
          </Reveal>
        </div>

        {cat.kind === "pdp" && <PdpCarousel pdps={starFirst(db.pdps)} />}
        {cat.kind === "models" && <ModelsGrid models={starFirst(db.models)} />}
        {cat.kind === "arc" && (
          <CreationsArc
            items={starFirst(db.creations.filter((c) => c.categoryId === cat.id)).map((c) => ({ id: c.id, image: c.image, title: c.title }))}
          />
        )}
      </main>
      <Footer name={db.site.name} />
    </>
  );
}
