"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Plus, Star, Trash2 } from "lucide-react";
import { FileField, SelectField, TextField } from "./fields";
import { cn } from "@/lib/utils";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "image" | "glb" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

type Row = { id: string; starred?: boolean; [k: string]: any };

function ListRow({ item, index, total, fields, title, thumb, starrable, open, onToggle, onPatch, onMove, onDelete }: {
  item: Row; index: number; total: number; fields: FieldDef[]; title: string; thumb?: string; starrable?: boolean; open: boolean;
  onToggle: () => void; onPatch: (p: Record<string, any>) => void; onMove: (d: -1 | 1) => void; onDelete: () => void;
}) {
  const controls = useDragControls();
  const icon = "grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-fg/10 hover:text-fg disabled:opacity-30";
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className="mb-3 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-2 p-2.5">
        <button type="button" aria-label="Déplacer" onPointerDown={(e) => controls.start(e)} className={cn(icon, "cursor-grab touch-none active:cursor-grabbing")}>
          <GripVertical size={18} />
        </button>
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-bg">
          {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
        </div>
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 truncate text-left text-sm font-medium">
          {title || "Sans titre"}
        </button>
        {starrable && (
          <button type="button" aria-label="Mettre en avant" title="Mettre en avant" onClick={() => onPatch({ starred: !item.starred })} className={cn(icon, item.starred && "text-fg")}>
            <Star size={17} fill={item.starred ? "currentColor" : "none"} />
          </button>
        )}
        <button type="button" aria-label="Monter" disabled={index === 0} onClick={() => onMove(-1)} className={icon}><ArrowUp size={17} /></button>
        <button type="button" aria-label="Descendre" disabled={index === total - 1} onClick={() => onMove(1)} className={icon}><ArrowDown size={17} /></button>
        <button
          type="button"
          aria-label="Supprimer"
          onClick={() => window.confirm(`Supprimer « ${title || "cet élément"} » ?`) && onDelete()}
          className={cn(icon, "hover:!text-red-500")}
        >
          <Trash2 size={17} />
        </button>
        <button type="button" aria-label="Modifier" onClick={onToggle} className={icon}>
          <ChevronDown size={18} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
          {fields.map((f) => {
            const v = item[f.key] ?? "";
            const wide = f.type === "textarea" || f.type === "image" || f.type === "glb";
            return (
              <div key={f.key} className={wide ? "sm:col-span-2" : ""}>
                {f.type === "image" || f.type === "glb" ? (
                  <FileField label={f.label} value={v} accept={f.type === "glb" ? ".glb,model/gltf-binary" : "image/*"} kind={f.type} onChange={(x) => onPatch({ [f.key]: x })} />
                ) : f.type === "select" ? (
                  <SelectField label={f.label} value={v} options={f.options ?? []} onChange={(x) => onPatch({ [f.key]: x })} />
                ) : (
                  <TextField
                    label={f.label}
                    value={v}
                    textarea={f.type === "textarea"}
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    onChange={(x) => onPatch({ [f.key]: f.type === "number" ? Number(x) : x })}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Reorder.Item>
  );
}

export function EditableList<T extends Row>({ items, onChange, fields, newItem, titleKey, thumbKey, starrable, addLabel, empty }: {
  items: T[]; onChange: (items: T[]) => void; fields: FieldDef[]; newItem: () => T; titleKey: string; thumbKey?: string;
  starrable?: boolean; addLabel: string; empty?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const patch = (id: string, p: Record<string, any>) => onChange(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const move = (idx: number, d: -1 | 1) => {
    const next = [...items];
    [next[idx], next[idx + d]] = [next[idx + d], next[idx]];
    onChange(next);
  };

  return (
    <div>
      {items.length === 0 && <p className="mb-4 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">{empty ?? "Rien ici pour l'instant."}</p>}
      <Reorder.Group axis="y" values={items} onReorder={onChange as any} className="list-none">
        {items.map((it, idx) => (
          <ListRow
            key={it.id}
            item={it}
            index={idx}
            total={items.length}
            fields={fields}
            title={String(it[titleKey] ?? "")}
            thumb={thumbKey ? it[thumbKey] : undefined}
            starrable={starrable}
            open={openId === it.id}
            onToggle={() => setOpenId(openId === it.id ? null : it.id)}
            onPatch={(p) => patch(it.id, p)}
            onMove={(d) => move(idx, d)}
            onDelete={() => onChange(items.filter((x) => x.id !== it.id))}
          />
        ))}
      </Reorder.Group>
      <button
        type="button"
        onClick={() => {
          const n = newItem();
          onChange([n, ...items]);
          setOpenId(n.id);
        }}
        className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}
