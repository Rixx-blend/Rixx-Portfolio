"use client";

import { useEffect, useState } from "react";
import type { testimonials as Items } from "@/lib/content";

type Testimonial = (typeof Items)[number];

// Avis clients : défilement automatique, navigation par points.
export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  const current = items[index];

  return (
    <div>
      <div className="testimonial reveal" key={current.id}>
        <p>“{current.text}”</p>
        <small>{current.name}</small>
      </div>
      <div className="dots">
        {items.map((t, i) => (
          <button
            key={t.id}
            aria-label={`Avis ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
