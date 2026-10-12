"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionValue, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { EASE } from "@/lib/utils";

export interface ArcItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  href?: string;
}

const STEP = 25; // degrés entre deux cartes
const RADIUS = 1100;

function ArcCard({ item, index, pos, onSelect }: { item: ArcItem; index: number; pos: MotionValue<number>; onSelect?: (i: number) => void }) {
  const transform = useTransform(pos, (p) => {
    const o = index - p;
    const a = o * STEP;
    const rad = (a * Math.PI) / 180;
    const x = Math.sin(rad) * RADIUS;
    const z = (Math.cos(rad) - 1) * RADIUS;
    const y = (1 - Math.cos(rad)) * RADIUS * 0.22;
    const rot = Math.max(-65, Math.min(65, -a * 1.5));
    const scale = Math.max(0.45, 1 - 0.2 * Math.abs(o));
    return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rot}deg) scale(${scale})`;
  });
  const opacity = useTransform(pos, (p) => Math.max(0, 1 - 0.32 * Math.abs(index - p)));
  const shade = useTransform(pos, (p) => Math.min(0.75, Math.abs(index - p) * 0.38));
  const zIndex = useTransform(pos, (p) => Math.round(100 - Math.abs(index - p) * 10));
  const events = useTransform(pos, (p) => (Math.abs(index - p) > 2.6 ? "none" : "auto"));

  const inner = (
    <>
      <img src={item.image} alt={item.title} draggable={false} className="h-full w-full object-cover" loading="lazy" />
      <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-black" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
        <p className="text-lg font-semibold tracking-tight md:text-2xl">{item.title}</p>
        {item.subtitle && <p className="text-xs text-white/70 md:text-sm">{item.subtitle}</p>}
      </div>
    </>
  );
  const cls = "relative block aspect-video w-[min(62vw,640px)] overflow-hidden rounded-3xl border border-line bg-card shadow-2xl";

  return (
    <motion.div
      style={{ transform, opacity, zIndex, pointerEvents: events as any }}
      className="absolute left-1/2 top-1/2 -ml-[min(31vw,320px)] -mt-[min(17.4vw,180px)] will-change-transform"
    >
      {item.href ? (
        <Link href={item.href} className={cls}>{inner}</Link>
      ) : (
        <button type="button" onClick={() => onSelect?.(index)} className={`${cls} text-left`}>{inner}</button>
      )}
    </motion.div>
  );
}

export function ArcGallery({ items, heading, onSelect, id }: { items: ArcItem[]; heading?: string; onSelect?: (i: number) => void; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = items.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, n - 1)]);
  const pos = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.7 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(pos, "change", (v) => setActive(Math.max(0, Math.min(n - 1, Math.round(v)))));
  useEffect(() => setActive(0), [n]);

  if (n === 0) return <p className="px-5 py-32 text-center text-muted">Rien à afficher pour l'instant.</p>;
  const cur = items[active];

  return (
    <div id={id}>
      {/* Desktop : arc 3D piloté par le scroll */}
      <div ref={ref} style={{ height: `${n * 55 + 100}vh` }} className="relative hidden md:block">
        <div className="sticky top-0 flex h-screen flex-col items-center overflow-hidden pt-24">
          {heading && <h2 className="title-lg text-center">{heading}</h2>}
          <div className="perspective relative w-full flex-1">
            <div className="preserve-3d absolute inset-0">
              {items.map((it, i) => (
                <ArcCard key={it.id} item={it} index={i} pos={pos} onSelect={onSelect} />
              ))}
            </div>
          </div>
          <div className="mb-10 h-14 text-center">
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }}>
                <p className="text-xl font-semibold tracking-tight">{cur.title}</p>
                {cur.subtitle && <p className="text-sm text-muted">{cur.subtitle}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile : carrousel swipe */}
      <div className="py-16 md:hidden">
        {heading && <h2 className="title-lg mb-8 px-5 text-center">{heading}</h2>}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5">
          {items.map((it, i) => {
            const body = (
              <>
                <img src={it.image} alt={it.title} className="aspect-video w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="font-semibold tracking-tight">{it.title}</p>
                  {it.subtitle && <p className="text-xs text-muted">{it.subtitle}</p>}
                </div>
              </>
            );
            const c = "w-[82vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-line bg-card text-left";
            return it.href ? (
              <Link key={it.id} href={it.href} className={c}>{body}</Link>
            ) : (
              <button key={it.id} onClick={() => onSelect?.(i)} className={c}>{body}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
