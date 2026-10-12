"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ArcItem } from "./arc-gallery";
import { EASE } from "@/lib/utils";

export function Lightbox({ items, index, onClose, onChange }: { items: ArcItem[]; index: number; onClose: () => void; onChange: (i: number) => void }) {
  const n = items.length;
  const prev = () => onChange((index - 1 + n) % n);
  const next = () => onChange((index + 1) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  const it = items[index];
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={onClose}
    >
      <button aria-label="Fermer" onClick={onClose} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
        <X size={20} />
      </button>
      {n > 1 && (
        <>
          <button aria-label="Précédent" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <ChevronLeft size={22} />
          </button>
          <button aria-label="Suivant" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <ChevronRight size={22} />
          </button>
        </>
      )}
      <motion.figure
        key={it.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, i) => {
          if (i.offset.x < -80) next();
          else if (i.offset.x > 80) prev();
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-h-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={it.image} alt={it.title} draggable={false} className="max-h-[80vh] w-full rounded-2xl object-contain" />
        <figcaption className="mt-3 text-center text-sm text-white/80">{it.title} · {index + 1}/{n}</figcaption>
      </motion.figure>
    </motion.div>
  );
}
