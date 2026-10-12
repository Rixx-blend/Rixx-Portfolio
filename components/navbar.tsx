"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./providers";
import { EASE } from "@/lib/utils";

export function Navbar({ name }: { name: string }) {
  const { theme, toggle } = useTheme();
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last.current && y > 120);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass fixed inset-x-0 top-0 z-50 border-b border-line"
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">{name}</Link>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/#galerie" className="transition-colors hover:text-fg">Créations</Link>
          <Link href="/#contact" className="transition-colors hover:text-fg">Contact</Link>
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-fg transition-transform duration-500 ease-out hover:rotate-12"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
