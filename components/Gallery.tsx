"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@/lib/content";

// Galerie par catégorie : chaque carte s'incline selon sa position
// dans la piste, ce qui donne l'effet d'arc 3D au défilement.
function GalleryTrack({ items }: { items: Category["items"] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const center = track.getBoundingClientRect().left + track.clientWidth / 2;
      const cards = track.querySelectorAll<HTMLElement>(".card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const offset = (rect.left + rect.width / 2 - center) / track.clientWidth;
        const angle = Math.max(-35, Math.min(35, -offset * 35));
        card.style.transform = `rotateY(${angle}deg) scale(${1 - Math.min(Math.abs(offset), 0.5) * 0.2})`;
      });
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="track" ref={trackRef}>
      {items.map((item) => (
        <div className="card" key={item.id}>
          {item.image && <img src={item.image} alt={item.title} />}
          <span>{item.title}</span>
        </div>
      ))}
    </div>
  );
}

export default function Gallery({ categories }: { categories: Category[] }) {
  return (
    <>
      {categories.map((cat) => (
        <div className="category" key={cat.id}>
          <h3>{cat.title}</h3>
          <GalleryTrack items={cat.items} />
        </div>
      ))}
    </>
  );
}
