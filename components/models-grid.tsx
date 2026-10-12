"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, X } from "lucide-react";
import type { Model3D } from "@/lib/types";
import { EASE } from "@/lib/utils";

const ModelViewer = dynamic(() => import("./model-viewer"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-white/60">Chargement du viewer…</div>,
});

function webgl(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function ModelsGrid({ models }: { models: Model3D[] }) {
  const [open, setOpen] = useState<Model3D | null>(null);
  const [tris, setTris] = useState<number | null>(null);
  const [gl, setGl] = useState(true);

  useEffect(() => setGl(webgl()), []);
  useEffect(() => {
    if (!open) return;
    setTris(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (models.length === 0) return <p className="py-32 text-center text-muted">Aucun modèle pour l'instant.</p>;

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-5 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m, i) => (
          <motion.button
            key={m.id}
            onClick={() => setOpen(m)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -6 }}
            className="group overflow-hidden rounded-3xl border border-line bg-card text-left"
          >
            <div className="relative aspect-video overflow-hidden bg-black">
              {m.preview ? (
                <img src={m.preview} alt={m.title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="grid h-full place-items-center text-white/40"><Box size={40} /></div>
              )}
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">Ouvrir en 3D</span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold tracking-tight">{m.title}</h3>
              <p className="text-sm text-muted">{m.tools}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col bg-black"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4 p-5 text-white">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{open.title}</h3>
                <p className="text-sm text-white/60">{open.tools}{tris !== null && ` · ${tris.toLocaleString("fr-FR")} triangles`}</p>
                {open.description && <p className="mt-2 max-w-xl text-sm text-white/80">{open.description}</p>}
              </div>
              <button aria-label="Fermer" onClick={() => setOpen(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
                <X size={20} />
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              {gl ? (
                <ModelViewer url={open.glb} onInfo={(i) => setTris(i.tris)} />
              ) : (
                <img src={open.preview} alt={open.title} className="mx-auto h-full object-contain" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
