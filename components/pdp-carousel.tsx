"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pdp } from "@/lib/types";
import { EASE } from "@/lib/utils";

// Adapté de circular-testimonials : PDP rondes, 5 visibles, thème noir/blanc, Tailwind + lucide.
export function PdpCarousel({ pdps }: { pdps: Pdp[] }) {
  const n = pdps.length;
  const [active, setActive] = useState(0);
  const [w, setW] = useState(1000);
  const stage = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(false);

  const next = useCallback(() => setActive((a) => (a + 1) % n), [n]);
  const prev = useCallback(() => setActive((a) => (a - 1 + n) % n), [n]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (n === 0) return <p className="py-32 text-center text-muted">Aucune photo de profil pour l'instant.</p>;

  const size = Math.min(300, w * 0.36);
  const step = Math.min(210, w * 0.23);
  const half = Math.floor(n / 2);
  const cur = pdps[active];

  const dist = (i: number) => {
    let d = (i - active) % n;
    if (d > half) d -= n;
    if (d < -half) d += n;
    return d;
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24">
      <div
        ref={stage}
        className="relative mx-auto flex touch-pan-y items-center justify-center"
        style={{ height: size + 40 }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > 30 && !wheelLock.current) {
            wheelLock.current = true;
            e.deltaX > 0 ? next() : prev();
            setTimeout(() => (wheelLock.current = false), 450);
          }
        }}
      >
        {pdps.map((p, i) => {
          const d = dist(i);
          const a = Math.abs(d);
          const visible = a <= 2;
          return (
            <motion.button
              key={p.id}
              aria-label={p.name}
              onClick={() => setActive(i)}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) next();
                else if (info.offset.x > 60) prev();
              }}
              initial={false}
              animate={{
                x: d * step,
                scale: a === 0 ? 1 : a === 1 ? 0.62 : 0.4,
                opacity: visible ? (a === 0 ? 1 : a === 1 ? 0.75 : 0.4) : 0,
                filter: `blur(${a === 0 ? 0 : a === 1 ? 2 : 5}px)`,
                zIndex: 10 - a,
              }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ width: size, height: size, pointerEvents: visible ? "auto" : "none" }}
              className="absolute overflow-hidden rounded-full border border-line bg-card shadow-2xl"
            >
              <img src={p.image} alt={p.name} draggable={false} className="h-full w-full object-cover" />
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-[9rem]"
          >
            <h3 className="text-3xl font-bold tracking-tight">{cur.name}</h3>
            <p className="mt-1 text-muted">
              {cur.handle}
              {cur.platform && <span className="ml-2 rounded-full border border-line px-2.5 py-0.5 text-xs">{cur.platform}</span>}
            </p>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-fg/90">
              {cur.project.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut", delay: 0.025 * i }}
                  style={{ display: "inline-block" }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex gap-4">
          {[{ f: prev, I: ChevronLeft, l: "Précédent" }, { f: next, I: ChevronRight, l: "Suivant" }].map(({ f, I, l }) => (
            <button
              key={l}
              onClick={f}
              aria-label={l}
              className="grid h-11 w-11 place-items-center rounded-full bg-fg text-bg transition-transform duration-300 ease-out hover:scale-110 active:scale-95"
            >
              <I size={22} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
