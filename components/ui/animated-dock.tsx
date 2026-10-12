"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockItemData {
  link: string;
  Icon: React.ReactNode;
  label?: string;
  target?: string;
}
export interface AnimatedDockProps {
  className?: string;
  items: DockItemData[];
}

// Adapté de animated-dock : même effet loupe, thème noir/blanc, étiquette au survol.
export const AnimatedDock = ({ className, items }: AnimatedDockProps) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("glass mx-auto flex h-16 items-end gap-3 rounded-2xl border border-line px-4 pb-3 shadow-lg", className)}
    >
      {items.map((item, i) => (
        <DockItem key={i} mouseX={mouseX} label={item.label}>
          <a
            href={item.link}
            target={item.target ?? "_blank"}
            rel="noopener noreferrer"
            aria-label={item.label}
            className="flex h-full w-full grow items-center justify-center"
          >
            {item.Icon}
          </a>
        </DockItem>
      ))}
    </motion.div>
  );
};

export const DockItem = ({ mouseX, label, children }: { mouseX: MotionValue<number>; label?: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });
  const widthSync = useTransform(distance, [-150, 0, 150], [44, 84, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const iconScale = useTransform(width, [44, 84], [1, 1.5]);
  const iconSpring = useSpring(iconScale, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      whileTap={{ scale: 0.88 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex aspect-square w-11 items-center justify-center rounded-full bg-fg text-bg"
    >
      {label && (
        <span
          className={cn(
            "pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs font-medium text-bg transition-all duration-300 ease-out",
            hover ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
        >
          {label}
        </span>
      )}
      <motion.div style={{ scale: iconSpring }} className="flex h-full w-full grow items-center justify-center">
        {children}
      </motion.div>
    </motion.div>
  );
};
