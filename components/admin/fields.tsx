"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadFile } from "@/lib/upload";

export const inputCls =
  "w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-fg/50";

export function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-medium text-muted">{children}</span>;
}

export function TextField({ label, value, onChange, textarea, type = "text", placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void; textarea?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      {textarea ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

export function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function FileField({ label, value, onChange, accept, kind }: {
  label: string; value: string; onChange: (v: string) => void; accept: string; kind: "image" | "glb";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadFile(f));
    } catch (e: any) {
      setErr(e?.message ?? "Échec de l'envoi");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {kind === "image" && (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-card">
            {value && <img src={value} alt="" className="h-full w-full object-cover" />}
          </div>
        )}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={kind === "glb" ? "Lien du .glb" : "Lien de l'image"} className={inputCls} />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-fg px-3 py-2.5 text-sm font-medium text-bg disabled:opacity-50"
        >
          <Upload size={15} /> {busy ? "Envoi…" : "Importer"}
        </button>
        <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {err && <p className="mt-1.5 text-xs text-red-500">{err}</p>}
    </div>
  );
}
