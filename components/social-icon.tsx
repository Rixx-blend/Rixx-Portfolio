import { Globe } from "lucide-react";
import {
  FaArtstation, FaBehance, FaDiscord, FaGithub, FaInstagram, FaLinkedin, FaTiktok, FaTwitch, FaXTwitter, FaYoutube,
} from "react-icons/fa6";
import type { Social } from "@/lib/types";

const MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  youtube: FaYoutube, x: FaXTwitter, twitter: FaXTwitter, instagram: FaInstagram, tiktok: FaTiktok, discord: FaDiscord,
  twitch: FaTwitch, github: FaGithub, behance: FaBehance, artstation: FaArtstation, linkedin: FaLinkedin,
};

export function SocialIcon({ social, size = 20 }: { social: Pick<Social, "platform" | "icon">; size?: number }) {
  if (social.icon) return <img src={social.icon} alt="" style={{ width: size, height: size }} className="rounded-sm object-contain" />;
  const I = MAP[social.platform.trim().toLowerCase()] ?? Globe;
  return <I size={size} />;
}
