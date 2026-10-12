import type { Db } from "./types";

const p = (n: string) => `/placeholders/${n}.svg`;

export const defaultDb: Db = {
  site: {
    name: "Rixx",
    subtitle: "Graphic Designer",
    about:
      "Je crée des visuels qui donnent envie de cliquer : miniatures YouTube, bannières, photos de profil, miniatures UEFN et rendus 3D pour les créateurs de contenu Fortnite. Du modèle 3D à l'image finale, chaque détail est pensé pour ta chaîne.",
    avatar: p("avatar"),
    contactTitle1: "Tu as un projet ?",
    contactTitle2: "Parlons-en.",
    discordLabel: "Écrire sur Discord",
    discordUrl: "https://discord.com/",
  },
  tools: [
    { id: "t1", name: "Blender", logo: p("tool-blender") },
    { id: "t2", name: "OctaneRender", logo: p("tool-octane") },
    { id: "t3", name: "Photoshop", logo: p("tool-photoshop") },
    { id: "t4", name: "UEFN", logo: p("tool-uefn") },
  ],
  categories: [
    { id: "c-pdp", slug: "pdp", name: "Photos de profil", cover: p("cover-pdp"), from: 10, kind: "pdp" },
    { id: "c-ban", slug: "bannieres", name: "Bannières", cover: p("cover-bannieres"), from: 20, kind: "arc" },
    { id: "c-min", slug: "miniatures", name: "Miniatures YouTube", cover: p("cover-miniatures"), from: 15, kind: "arc" },
    { id: "c-uefn", slug: "uefn", name: "Miniatures UEFN", cover: p("cover-uefn"), from: 25, kind: "arc" },
    { id: "c-3d", slug: "modeles-3d", name: "Modèles 3D", cover: p("cover-modeles-3d"), from: 30, kind: "models" },
  ],
  creations: [
    ...[1, 2, 3].map((i) => ({ id: `ban${i}`, categoryId: "c-ban", title: `Bannière ${i}`, image: p(`banniere-${i}`), starred: false })),
    ...[1, 2, 3].map((i) => ({ id: `min${i}`, categoryId: "c-min", title: `Miniature ${i}`, image: p(`miniature-${i}`), starred: false })),
    ...[1, 2, 3].map((i) => ({ id: `uefn${i}`, categoryId: "c-uefn", title: `UEFN ${i}`, image: p(`uefn-${i}`), starred: false })),
  ],
  pdps: [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `pdp${i}`,
    name: `Client ${i}`,
    handle: `@client${i}`,
    platform: i % 2 ? "YouTube" : "Twitch",
    project: "Pack photo de profil et bannière assortie pour sa chaîne.",
    image: p(`pdp-${i}`),
    starred: false,
  })),
  models: [
    {
      id: "m1",
      title: "Cube de démonstration",
      tools: "Blender",
      description: "Remplace ce modèle par tes propres fichiers .glb depuis l'espace admin.",
      glb: "/models/cube.glb",
      preview: p("model-cube"),
      starred: false,
    },
  ],
  socials: [
    { id: "s1", platform: "YouTube", url: "https://www.youtube.com/@rixx.blender", icon: "" },
    { id: "s2", platform: "X", url: "https://x.com/", icon: "" },
    { id: "s3", platform: "Instagram", url: "https://www.instagram.com/", icon: "" },
    { id: "s4", platform: "TikTok", url: "https://www.tiktok.com/", icon: "" },
    { id: "s5", platform: "Discord", url: "https://discord.com/", icon: "" },
  ],
};
