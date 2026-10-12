"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { Site, Social } from "@/lib/types";
import { AnimatedDock } from "./ui/animated-dock";
import { SocialIcon } from "./social-icon";
import { EASE } from "@/lib/utils";

export function Contact({ site, socials }: { site: Site; socials: Social[] }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-32 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="title-xl !text-[clamp(2.6rem,9vw,7rem)]"
      >
        {site.contactTitle1}
        <br />
        <span className="text-muted">{site.contactTitle2}</span>
      </motion.h2>

      <motion.a
        href={site.discordUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-fg px-8 py-4 text-base font-medium text-bg"
      >
        <MessageCircle size={18} />
        {site.discordLabel}
      </motion.a>

      <div className="mt-24">
        <AnimatedDock
          items={socials.map((s) => ({
            link: s.url,
            label: s.platform,
            target: "_blank",
            Icon: <SocialIcon social={s} size={20} />,
          }))}
        />
      </div>
    </section>
  );
}
