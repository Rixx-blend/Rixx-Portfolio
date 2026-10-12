import "server-only";
import fs from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";
import { defaultDb } from "./defaults";
import type { Db } from "./types";

const KEY = "rixx:db";
const FILE = path.join(process.cwd(), "data", "db.json");

function redis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function merge(stored: Partial<Db> | null): Db {
  return { ...defaultDb, ...(stored ?? {}), site: { ...defaultDb.site, ...(stored?.site ?? {}) } };
}

export async function getDb(): Promise<Db> {
  try {
    const r = redis();
    if (r) return merge(await r.get<Db>(KEY));
    return merge(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    return defaultDb;
  }
}

export async function saveDb(db: Db): Promise<void> {
  const r = redis();
  if (r) {
    await r.set(KEY, db);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error("Aucune base configurée : ajoute l'intégration Upstash Redis dans Vercel.");
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

export const starFirst = <T extends { starred: boolean }>(items: T[]): T[] =>
  [...items.filter((i) => i.starred), ...items.filter((i) => !i.starred)];
