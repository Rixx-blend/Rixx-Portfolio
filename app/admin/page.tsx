"use client";

import { useEffect, useState } from "react";

type Photo = { id: string; src: string; alt: string; title: string; place: string };

const box: React.CSSProperties = { fontFamily: "Helvetica, Arial, sans-serif", fontSize: 14, color: "#111" };
const input: React.CSSProperties = { padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" };
const btn: React.CSSProperties = { padding: "6px 12px", border: "1px solid #111", background: "#fff", borderRadius: 4, cursor: "pointer" };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (res.status === 401) return setAuthed(false);
    const data = await res.json();
    setPhotos(data.photos);
    setAuthed(true);
  };

  useEffect(() => {
    load();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return setError("Code incorrect");
    setCode("");
    load();
  };

  const update = (i: number, patch: Partial<Photo>) =>
    setPhotos((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const move = (i: number, dir: -1 | 1) =>
    setPhotos((ps) => {
      const j = i + dir;
      if (j < 0 || j >= ps.length) return ps;
      const copy = [...ps];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (i: number) => setPhotos((ps) => ps.filter((_, idx) => idx !== i));

  const upload = async (file: File) => {
    setBusy(true);
    setMsg("Envoi de la photo…");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    setBusy(false);
    if (!res.ok) return setMsg("Échec de l'envoi (fichier trop lourd ? 4,5 Mo maximum)");
    const { src } = await res.json();
    const n = String(photos.length + 1).padStart(2, "0");
    setPhotos((ps) => [
      ...ps,
      { id: `${Date.now()}`, src, alt: file.name, title: `Titre ${n}`, place: "Lieu" },
    ]);
    setMsg("Photo ajoutée. Pense à enregistrer.");
  };

  const save = async () => {
    setBusy(true);
    setMsg("Enregistrement…");
    const res = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos }),
    });
    setBusy(false);
    setMsg(res.ok ? "Enregistré. Le site est mis à jour." : "Erreur à l'enregistrement.");
  };

  if (authed === null) return <main style={{ ...box, padding: 32 }}>Chargement…</main>;

  if (!authed) {
    return (
      <main style={{ ...box, padding: 32, maxWidth: 360 }}>
        <h1 style={{ fontSize: 20, marginTop: 0 }}>Administration</h1>
        <form onSubmit={login} style={{ display: "grid", gap: 10 }}>
          <input
            type="password"
            placeholder="Code d'accès"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={input}
          />
          <button type="submit" style={btn}>Entrer</button>
          {error && <p style={{ color: "#a00", margin: 0 }}>{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main style={{ ...box, padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 20 }}>Galerie — administration</h1>
        <button style={btn} onClick={save} disabled={busy}>Enregistrer</button>
      </header>

      <p style={{ color: "#555" }}>{msg}</p>

      <div style={{ margin: "16px 0", padding: 16, border: "1px dashed #aaa", borderRadius: 6 }}>
        <label>
          Ajouter une photo :{" "}
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
      </div>

      <ol style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
        {photos.map((p, i) => (
          <li key={p.id + i} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 16, alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 12 }}>
            <img src={p.src} alt={p.alt} style={{ width: 120, height: 90, objectFit: "cover", filter: "grayscale(1)" }} />
            <div style={{ display: "grid", gap: 6 }}>
              <input style={input} placeholder="Titre" value={p.title} onChange={(e) => update(i, { title: e.target.value })} />
              <input style={input} placeholder="Lieu" value={p.place} onChange={(e) => update(i, { place: e.target.value })} />
              <input style={input} placeholder="Description (alt)" value={p.alt} onChange={(e) => update(i, { alt: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={btn} onClick={() => move(i, -1)} aria-label="Monter">↑</button>
              <button style={btn} onClick={() => move(i, 1)} aria-label="Descendre">↓</button>
              <button style={{ ...btn, borderColor: "#a00", color: "#a00" }} onClick={() => remove(i)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
