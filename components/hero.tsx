"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Site, Tool } from "@/lib/types";
import { EASE } from "@/lib/utils";

export function Hero({ site, tools }: { site: Site; tools: Tool[] }) {
  const [big, setBig] = useState(false);
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia("(hover: none)").matches), []);

  const size = big ? 180 : 96;

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 pb-16 pt-28 md:grid-cols-2">
      <div>
        <motion.h1
          className="title-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          {site.name}
        </motion.h1>
        <motion.p
          className="mt-4 text-2xl font-medium tracking-tight text-muted md:text-4xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        >
          {site.subtitle}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        className="rounded-3xl border border-line bg-card p-7"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">À propos</p>
        <div className="flow-root text-base leading-relaxed md:text-lg">
          <motion.img
            src={site.avatar}
            alt={site.name}
            onMouseEnter={() => !touch && setBig(true)}
            onMouseLeave={() => !touch && setBig(false)}
            onClick={() => touch && setBig((b) => !b)}
            animate={{ width: size, height: size }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ shapeOutside: "circle(50%)", float: "right", margin: "0 0 12px 18px" }}
            className="cursor-pointer rounded-full object-cover"
          />
          {site.about}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          {tools.map((t) => (
            <span key={t.id} className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
              {t.logo && <img src={t.logo} alt="" className="h-4 w-4 rounded-sm object-contain" />}
              {t.name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
