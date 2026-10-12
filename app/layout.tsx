import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getDb();
  const title = `${site.name} — ${site.subtitle}`;
  const description = site.about.slice(0, 160);
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "fr_FR", images: [site.avatar] },
    twitter: { card: "summary_large_image", title, description, images: [site.avatar] },
    icons: { icon: site.avatar },
  };
}
export const viewport: Viewport = { themeColor: "#000000" };

const themeScript = `try{var t=localStorage.getItem('rixx-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
