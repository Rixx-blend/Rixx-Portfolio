"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Lock, LogOut, Save } from "lucide-react";
import type { Category, Creation, Db, Model3D, Pdp, Social, Tool } from "@/lib/types";
import { PLATFORMS } from "@/lib/platforms";
import { slugify, uid } from "@/lib/upload";
import { cn, EASE } from "@/lib/utils";
import { EditableList } from "./editable-list";
import { FileField, SelectField, TextField, inputCls } from "./fields";

const TABS = [
  { id: "home", label: "Accueil" },
  { id: "cats", label: "Catégories" },
  { id: "creations", label: "Créations" },
  { id: "pdps", label: "PDP" },
  { id: "models", label: "Modèles 3D" },
  { id: "socials", label: "Réseaux" },
  { id: "contact", label: "Contact" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const KINDS = [
  { value: "arc", label: "Arc paysage (images)" },
  { value: "pdp", label: "PDP circulaires" },
  { value: "models", label: "Modèles 3D" },
];
const RESERVED = ["admin", "api", "_next"];

function Login({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) onDone();
    else setErr(j.error ?? "Erreur");
  };

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="w-full max-w-sm rounded-3xl border border-line bg-card p-8 text-center"
      >
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-fg text-bg"><Lock size={20} /></div>
        <h1 className="text-2xl font-semibold tracking-tight">Espace admin</h1>
        <p className="mt-1 text-sm text-muted">Entre ton code d'accès.</p>
        <input
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code d'accès"
          className={cn(inputCls, "mt-6 text-center")}
        />
        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
        <button disabled={busy || !code} className="mt-5 w-full rounded-full bg-fg py-3 text-sm font-medium text-bg disabled:opacity-50">
          {busy ? "Vérification…" : "Entrer"}
        </button>
        <Link href="/" className="mt-4 inline-block text-xs text-muted hover:text-fg">← Retour au site</Link>
      </motion.form>
    </main>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mb-6 mt-1 text-sm text-muted">{hint}</p>}
      {!hint && <div className="mb-6" />}
      {children}
    </div>
  );
}

export function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [db, setDb] = useState<Db | null>(null);
  const [tab, setTab] = useState<TabId>("home");
  const [catId, setCatId] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const d = (await (await fetch("/api/data", { cache: "no-store" })).json()) as Db;
    setDb(d);
    setCatId((c) => c || d.categories.find((x) => x.kind === "arc")?.id || "");
  }, []);

  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      setAuthed(!!j.admin);
      if (j.admin) load();
    });
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (patch: Partial<Db>) => {
    setDb((d) => (d ? { ...d, ...patch } : d));
    setDirty(true);
  };
  const setSite = (p: Partial<Db["site"]>) => db && update({ site: { ...db.site, ...p } });

  const save = async () => {
    if (!db) return;
    // slugs propres et uniques
    const seen = new Set<string>();
    const categories = db.categories.map((c) => {
      let s = slugify(c.slug || c.name) || "categorie";
      if (RESERVED.includes(s)) s += "-1";
      while (seen.has(s)) s += "-" + uid().slice(0, 2);
      seen.add(s);
      return { ...c, slug: s };
    });
    const next = { ...db, categories };
    setSaving(true);
    const r = await fetch("/api/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (r.ok) {
      setDb(next);
      setDirty(false);
      setToast({ ok: true, text: "Enregistré. Les changements sont en ligne." });
    } else {
      setToast({ ok: false, text: j.error ?? "Échec de l'enregistrement." });
    }
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthed(false);
    setDb(null);
  };

  if (authed === null) return <main className="grid min-h-screen place-items-center text-sm text-muted">Chargement…</main>;
  if (!authed) return <Login onDone={() => { setAuthed(true); load(); }} />;
  if (!db) return <main className="grid min-h-screen place-items-center text-sm text-muted">Chargement…</main>;

  const arcCats = db.categories.filter((c) => c.kind === "arc");
  const curCreations = db.creations.filter((c) => c.categoryId === catId);

  return (
    <div className="min-h-screen pb-32">
      <header className="glass sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-5">
          <span className="text-sm font-semibold">Admin · {db.site.name}</span>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg">
              <ExternalLink size={13} /> Voir le site
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg">
              <LogOut size={13} /> Déconnexion
            </button>
          </div>
        </div>
        <div className="no-scrollbar mx-auto flex max-w-4xl gap-1 overflow-x-auto px-5 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors", tab === t.id ? "bg-fg text-bg" : "text-muted hover:text-fg")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        {tab === "home" && (
          <Panel title="Accueil" hint="Nom, texte « À propos », photo de profil et outils affichés sur la page d'accueil.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nom" value={db.site.name} onChange={(v) => setSite({ name: v })} />
              <TextField label="Sous-titre" value={db.site.subtitle} onChange={(v) => setSite({ subtitle: v })} />
              <div className="sm:col-span-2"><TextField label="Texte À propos" textarea value={db.site.about} onChange={(v) => setSite({ about: v })} /></div>
              <div className="sm:col-span-2"><FileField label="Ma photo de profil" kind="image" accept="image/*" value={db.site.avatar} onChange={(v) => setSite({ avatar: v })} /></div>
            </div>
            <h3 className="mb-4 mt-12 text-lg font-semibold tracking-tight">Outils</h3>
            <EditableList<Tool>
              items={db.tools}
              onChange={(tools) => update({ tools })}
              titleKey="name"
              thumbKey="logo"
              addLabel="Ajouter un outil"
              newItem={() => ({ id: uid(), name: "Nouvel outil", logo: "" })}
              fields={[
                { key: "name", label: "Nom", type: "text" },
                { key: "logo", label: "Logo", type: "image" },
              ]}
            />
          </Panel>
        )}

        {tab === "cats" && (
          <Panel title="Catégories" hint="Les cartes de l'arc 3D sur la page d'accueil. Glisse pour changer l'ordre. Le type d'affichage décide de la page ouverte au clic.">
            <EditableList<Category>
              items={db.categories}
              onChange={(categories) => update({ categories })}
              titleKey="name"
              thumbKey="cover"
              addLabel="Ajouter une catégorie"
              newItem={() => ({ id: "c-" + uid(), slug: "", name: "Nouvelle catégorie", cover: "", from: 15, kind: "arc" })}
              fields={[
                { key: "name", label: "Nom", type: "text" },
                { key: "slug", label: "Adresse (ex : miniatures)", type: "text", placeholder: "généré depuis le nom si vide" },
                { key: "from", label: "À partir de (€)", type: "number" },
                { key: "kind", label: "Type d'affichage", type: "select", options: KINDS },
                { key: "cover", label: "Image de couverture", type: "image" },
              ]}
            />
          </Panel>
        )}

        {tab === "creations" && (
          <Panel title="Créations" hint="Bannières, miniatures, UEFN… Choisis une catégorie, puis ajoute, modifie ou réordonne. L'étoile place une création en premier.">
            {arcCats.length === 0 ? (
              <p className="text-sm text-muted">Crée d'abord une catégorie de type « Arc paysage ».</p>
            ) : (
              <>
                <div className="mb-6 max-w-xs">
                  <SelectField label="Catégorie" value={catId} onChange={setCatId} options={arcCats.map((c) => ({ value: c.id, label: c.name }))} />
                </div>
                <EditableList<Creation>
                  key={catId}
                  items={curCreations}
                  onChange={(list) => update({ creations: [...db.creations.filter((c) => c.categoryId !== catId), ...list] })}
                  titleKey="title"
                  thumbKey="image"
                  starrable
                  addLabel="Ajouter une création"
                  empty="Aucune création dans cette catégorie."
                  newItem={() => ({ id: uid(), categoryId: catId, title: "Nouvelle création", image: "", starred: false })}
                  fields={[
                    { key: "title", label: "Titre", type: "text" },
                    { key: "image", label: "Image", type: "image" },
                  ]}
                />
              </>
            )}
          </Panel>
        )}

        {tab === "pdps" && (
          <Panel title="Photos de profil" hint="Affichées en cercle sur la page PDP. Les infos changent quand une PDP passe au centre.">
            <EditableList<Pdp>
              items={db.pdps}
              onChange={(pdps) => update({ pdps })}
              titleKey="name"
              thumbKey="image"
              starrable
              addLabel="Ajouter une PDP"
              newItem={() => ({ id: uid(), name: "Nouveau client", handle: "@", platform: "YouTube", project: "", image: "", starred: false })}
              fields={[
                { key: "name", label: "Nom", type: "text" },
                { key: "handle", label: "@ pseudo", type: "text" },
                { key: "platform", label: "Plateforme", type: "text" },
                { key: "project", label: "Projet réalisé", type: "textarea" },
                { key: "image", label: "Image", type: "image" },
              ]}
            />
          </Panel>
        )}

        {tab === "models" && (
          <Panel title="Modèles 3D" hint="Importe tes fichiers .glb (compression Draco et textures 2K recommandées). Les visiteurs peuvent les explorer en 3D.">
            <EditableList<Model3D>
              items={db.models}
              onChange={(models) => update({ models })}
              titleKey="title"
              thumbKey="preview"
              starrable
              addLabel="Ajouter un modèle"
              newItem={() => ({ id: uid(), title: "Nouveau modèle", tools: "Blender", description: "", glb: "", preview: "", starred: false })}
              fields={[
                { key: "title", label: "Titre", type: "text" },
                { key: "tools", label: "Outils utilisés", type: "text" },
                { key: "description", label: "Description", type: "textarea" },
                { key: "glb", label: "Fichier .glb", type: "glb" },
                { key: "preview", label: "Image d'aperçu (optionnelle)", type: "image" },
              ]}
            />
          </Panel>
        )}

        {tab === "socials" && (
          <Panel title="Réseaux" hint="Affichés dans le dock animé en bas de la page d'accueil. Choisis une plateforme (icône automatique) ou importe ta propre icône.">
            <EditableList<Social>
              items={db.socials}
              onChange={(socials) => update({ socials })}
              titleKey="platform"
              thumbKey="icon"
              addLabel="Ajouter un réseau"
              newItem={() => ({ id: uid(), platform: "YouTube", url: "", icon: "" })}
              fields={[
                { key: "platform", label: "Plateforme", type: "select", options: PLATFORMS.map((p) => ({ value: p, label: p })) },
                { key: "url", label: "Lien", type: "text", placeholder: "https://…" },
                { key: "icon", label: "Icône personnalisée (optionnelle)", type: "image" },
              ]}
            />
          </Panel>
        )}

        {tab === "contact" && (
          <Panel title="Contact" hint="Le titre en bas de page et le lien du bouton Discord.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Titre, ligne 1" value={db.site.contactTitle1} onChange={(v) => setSite({ contactTitle1: v })} />
              <TextField label="Titre, ligne 2" value={db.site.contactTitle2} onChange={(v) => setSite({ contactTitle2: v })} />
              <TextField label="Texte du bouton" value={db.site.discordLabel} onChange={(v) => setSite({ discordLabel: v })} />
              <TextField label="Lien Discord" value={db.site.discordUrl} onChange={(v) => setSite({ discordUrl: v })} placeholder="https://discord.gg/…" />
            </div>
          </Panel>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-6">
        <div className="glass flex items-center gap-4 rounded-full border border-line py-2 pl-5 pr-2 shadow-xl">
          <span className="text-sm text-muted">{dirty ? "Modifications non enregistrées" : "Tout est enregistré"}</span>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
          >
            <Save size={15} /> {saving ? "Envoi…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={cn("fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-xl", toast.ok ? "bg-fg text-bg" : "bg-red-600 text-white")}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
