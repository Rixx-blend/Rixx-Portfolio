import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="title-lg">Page introuvable</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-fg px-6 py-3 text-bg">Retour à l'accueil</Link>
      </div>
    </main>
  );
}
