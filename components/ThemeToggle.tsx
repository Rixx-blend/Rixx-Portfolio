"use client";

import { useEffect, useState } from "react";

// Bascule jour / nuit : inverse les couleurs noir et blanc.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Changer le thème"
    >
      {theme === "light" ? "Mode nuit" : "Mode jour"}
    </button>
  );
}
