"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import "./GalleryFlow.css";

// Réglages du flux (px par seconde)
const BASE_SPEED = 34;   // vitesse de défilement normale
const HOVER_SPEED = 5;   // vitesse lorsqu'une photo est survolée
const SMOOTHING = 2.5;   // vitesse de transition entre les deux régimes
const CLOSE_DELAY = 320; // durée de la fermeture de la visionneuse (ms)

// Largeur (%) et décalage horizontal (%) pour alterner les tailles et les positions
const SIZES = [44, 70, 56, 86, 38, 62, 50, 78];
const OFFSETS = [6, 40, 18, 52, 2, 34, 22, 46];

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function GalleryFlow({ photos }) {
  const viewportRef = useRef(null);
  const setRef = useRef(null);
  const offsetRef = useRef(0);       // position dans le flux, en px
  const speedRef = useRef(BASE_SPEED);
  const hoverCountRef = useRef(0);   // nombre de photos survolées
  const pausedRef = useRef(false);   // true quand la visionneuse est ouverte
  const touchYRef = useRef(null);

  const [lightbox, setLightbox] = useState(null); // index de la photo ouverte
  const [closing, setClosing] = useState(false);

  // Déplace le flux de `delta` px en bouclant sur la hauteur d'une série
  const advance = useCallback((delta) => {
    const h = setRef.current?.offsetHeight || 1;
    offsetRef.current = (((offsetRef.current + delta) % h) + h) % h;
    if (viewportRef.current) {
      viewportRef.current.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
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

  // Défilement manuel : molette et glissement tactile, sans conflit avec le flux
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      if (!pausedRef.current) advance(e.deltaY);
    };
    const onTouchStart = (e) => {
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      if (touchYRef.current !== null && !pausedRef.current) {
        advance(touchYRef.current - y);
      }
      touchYRef.current = y;
      e.preventDefault();
    };
    const onTouchEnd = () => {
      touchYRef.current = null;
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

  // Fermeture avec une animation de sortie
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

  // Visionneuse : mise en pause du flux, clavier, verrouillage du scroll de page
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

  return (
    <div className="gf-root">
      <div className="gf-viewport" ref={viewportRef}>
        <div className="gf-track">
          {/* Deux séries identiques : la boucle est invisible */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="gf-set"
              ref={copy === 0 ? setRef : undefined}
              aria-hidden={copy === 1}
            >
              {photos.map((photo, i) => {
                const s = i % SIZES.length;
                return (
                  <figure
                    key={`${copy}-${photo.id ?? i}`}
                    className="gf-item"
                    style={{
                      width: `${SIZES[s]}%`,
                      marginLeft: `${OFFSETS[s]}%`,
                    }}
                    onMouseEnter={enter}
                    onMouseLeave={leave}
                    onClick={() => copy === 0 && setLightbox(i)}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    <span className="gf-num">{String(i + 1).padStart(3, "0")}</span>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>

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
            {String(lightbox + 1).padStart(3, "0")} / {String(photos.length).padStart(3, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
