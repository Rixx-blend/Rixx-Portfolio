"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArcGallery, type ArcItem } from "./arc-gallery";
import { Lightbox } from "./lightbox";

export function CreationsArc({ items }: { items: ArcItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ArcGallery items={items} onSelect={setOpen} />
      <AnimatePresence>
        {open !== null && <Lightbox items={items} index={open} onClose={() => setOpen(null)} onChange={setOpen} />}
      </AnimatePresence>
    </>
  );
}
