import Link from "next/link";
import { Lock } from "lucide-react";

export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-xs text-muted">
        <span>© {new Date().getFullYear()} {name}. Tous droits réservés.</span>
        <Link href="/admin" aria-label="Administration" className="flex items-center gap-1 opacity-50 transition-opacity hover:opacity-100">
          <Lock size={12} /> Admin
        </Link>
      </div>
    </footer>
  );
}
