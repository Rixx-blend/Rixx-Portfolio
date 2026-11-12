"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "./GalleryFlow.css";

// Réglages du flux (px par seconde)
const BASE_SPEED = 18;
const HOVER_SPEED = 2;
const SMOOTHING = 2.5;
const CLOSE_DELAY = 320;
const WHEEL_GAIN = 1.6; // sensibilité de la molette

// Aspect visuel de chaque carte, en cycle pour alterner rythme et inclinaison
const CARD_WIDTHS = [190, 230, 200, 250, 180, 220];
const TILTS = [-2.5, 1.5, -1, 2, -1.5, 1];
const LIFTS = [0, 18, -10, 24, 6, -16];

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function GalleryFlow({ photos }) {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const setRef = useRef(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);
  const hoverCountRef = useRef(0);
  const pausedRef = useRef(false);
  const touchXRef = useRef(null);

  const [lightbox, setLightbox] = useState(null);
  const [closing, setClosing] = useState(false);

  // Décale le flux horizontalement, en bouclant sur la largeur d'une série
  const advance = useCallback((delta) => {
    const w = setRef.current?.offsetWidth || 1;
    offsetRef.current = (((offsetRef.current + delta) % w) + w) % w;
    if (viewportRef.current) {
      viewportRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }
  }, []);

  // Boucle d'animation : mise à jour directe du DOM, sans re-rendu React
  useEffect(() => {
    const still = reducedMotion();
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = hoverCountRef.current > 0 ? HOVER_SPEED : BASE_SPEED;
      const k = 1 - Math.exp(-dt * SMOOTHING);
      speedRef.current += (target - speedRef.current) * k;

      if (!still && !pausedRef.current) advance(speedRef.current * dt);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [advance]);

  // Défilement manuel : molette (verticale ou horizontale) et glissement tactile
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      if (!pausedRef.current) advance((e.deltaX || e.deltaY) * WHEEL_GAIN);
    };
    const onTouchStart = (e) => {
      touchXRef.current = e.touches[0].clientX;
    };
    const onTouchMove = (e) => {
      const x = e.touches[0].clientX;
      if (touchXRef.current !== null && !pausedRef.current) {
        advance(touchXRef.current - x);
      }
      touchXRef.current = x;
      e.preventDefault();
    };
    const onTouchEnd = () => {
      touchXRef.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [advance]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setLightbox(null);
      setClosing(false);
    }, CLOSE_DELAY);
  }, []);

  const step = useCallback(
    (dir) => {
      setLightbox((i) => (i === null ? i : (i + dir + photos.length) % photos.length));
    },
    [photos.length]
  );

  // Visionneuse : pause du flux, clavier, verrouillage du scroll de page
  useEffect(() => {
    pausedRef.current = lightbox !== null;
    if (lightbox === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, close, step]);

  const enter = () => {
    if (canHover()) hoverCountRef.current += 1;
  };
  const leave = () => {
    if (canHover()) hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
  };

  const total = String(photos.length).padStart(2, "0");

  return (
    <div className="gf-root" ref={rootRef}>
      <img className="gf-camera" src="/lumix-tz99.png" alt="Lumix TZ99" draggable={false} />
      <div className="gf-viewport" ref={viewportRef}>
        <div className="gf-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="gf-set"
              ref={copy === 0 ? setRef : undefined}
              aria-hidden={copy === 1}
            >
              {photos.map((photo, i) => {
                const s = i % CARD_WIDTHS.length;
                return (
                  <figure
                    key={`${copy}-${photo.id ?? i}`}
                    className="gf-card"
                    style={{
                      width: `${CARD_WIDTHS[s]}px`,
                      transform: `translateY(${LIFTS[s]}px) rotate(${TILTS[s]}deg)`,
                    }}
                    onMouseEnter={enter}
                    onMouseLeave={leave}
                    onClick={() => copy === 0 && setLightbox(i)}
                  >
                    <div className="gf-photo">
                      <img
                        src={photo.src}
                        alt={photo.alt ?? ""}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </div>
                    <figcaption className="gf-caption">
                      <span className="gf-title">{photo.title ?? ""}</span>
                      <span className="gf-place">{photo.place ?? ""}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="gf-footer">
        <span>
          {String(1).padStart(2, "0")} — {total} &nbsp;&nbsp;&nbsp; FLUX CONTINU · NOIR &amp; BLANC
        </span>
        <span>SURVOLEZ POUR RALENTIR · CLIQUEZ POUR AGRANDIR</span>
      </footer>

      {lightbox !== null && (
        <div
          className={`gf-lightbox ${closing ? "is-closing" : ""}`}
          onClick={(e) => e.target === e.currentTarget && close()}
          role="dialog"
          aria-modal="true"
        >
          <img
            key={lightbox}
            className="gf-lightbox-img"
            src={photos[lightbox].src}
            alt={photos[lightbox].alt ?? ""}
          />
          <button className="gf-nav gf-prev" onClick={() => step(-1)} aria-label="Précédente">
            ‹
          </button>
          <button className="gf-nav gf-next" onClick={() => step(1)} aria-label="Suivante">
            ›
          </button>
          <span className="gf-counter">
            {String(lightbox + 1).padStart(2, "0")} / {total}
            {photos[lightbox].title ? ` — ${photos[lightbox].title}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
