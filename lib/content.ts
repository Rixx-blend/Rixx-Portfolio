// Contenu du portfolio. Modifiez ici les créations, services, réseaux et avis.
// Les images sont des chemins dans /public (ex: "/pdp.jpg"). Vide = placeholder.

export type Creation = {
  id: string;
  title: string;
  image?: string;
};

export type Category = {
  id: string;
  title: string;
  items: Creation[];
};

export const profile = {
  name: "Rixx",
  role: "Graphic Designer",
  about:
    "Créateur de visuels pour le gaming : miniatures YouTube, rendus 3D (Blender + Octane), montage photo et création de cartes UEFN.",
  avatar: "", // ex: "/pdp.jpg"
};

export const categories: Category[] = [
  {
    id: "miniatures",
    title: "Miniatures",
    items: [
      { id: "m1", title: "Miniature 01" },
      { id: "m2", title: "Miniature 02" },
      { id: "m3", title: "Miniature 03" },
    ],
  },
  {
    id: "pdp",
    title: "PDP",
    items: [
      { id: "p1", title: "PDP 01" },
      { id: "p2", title: "PDP 02" },
      { id: "p3", title: "PDP 03" },
    ],
  },
  {
    id: "bannieres",
    title: "Bannières",
    items: [
      { id: "b1", title: "Bannière 01" },
      { id: "b2", title: "Bannière 02" },
    ],
  },
  {
    id: "uefn",
    title: "Miniatures UEFN",
    items: [
      { id: "u1", title: "UEFN 01" },
      { id: "u2", title: "UEFN 02" },
    ],
  },
];

export const testimonials = [
  { id: "t1", name: "Client A", text: "Des miniatures qui font cliquer. Livraison rapide et très pro." },
  { id: "t2", name: "Client B", text: "Rendus 3D impeccables, communication claire du début à la fin." },
  { id: "t3", name: "Client C", text: "Mon channel a vraiment gagné en identité visuelle." },
];

export const socials = [
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@rixx.blender" },
  { id: "portfolio", label: "Portfolio", href: "https://rixx-designer.lovable.app" },
];

export const discordHref = ""; // lien Discord pour le contact, ex: "https://discord.gg/..."
