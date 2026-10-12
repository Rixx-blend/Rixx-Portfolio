export type CategoryKind = "arc" | "pdp" | "models";

export interface Category {
  id: string;
  slug: string;
  name: string;
  cover: string;
  from: number;
  kind: CategoryKind;
}
export interface Creation {
  id: string;
  categoryId: string;
  title: string;
  image: string;
  starred: boolean;
}
export interface Pdp {
  id: string;
  name: string;
  handle: string;
  platform: string;
  project: string;
  image: string;
  starred: boolean;
}
export interface Model3D {
  id: string;
  title: string;
  tools: string;
  description: string;
  glb: string;
  preview: string;
  starred: boolean;
}
export interface Social {
  id: string;
  platform: string;
  url: string;
  icon: string;
}
export interface Tool {
  id: string;
  name: string;
  logo: string;
}
export interface Site {
  name: string;
  subtitle: string;
  about: string;
  avatar: string;
  contactTitle1: string;
  contactTitle2: string;
  discordLabel: string;
  discordUrl: string;
}
export interface Db {
  site: Site;
  tools: Tool[];
  categories: Category[];
  creations: Creation[];
  pdps: Pdp[];
  models: Model3D[];
  socials: Social[];
}
