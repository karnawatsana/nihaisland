import { EventEmitter } from "events";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Islander, PosterConfig, PresState } from "@/lib/types";

export interface RoomRecord {
  code: string; demo: boolean; pinHash: string; salt: string;
  version: number; contentVersion: number;
  state: PresState; cast: Islander[]; poster: PosterConfig;
  updatedAt: number;
  light?: boolean; // loaded without the heavy photo columns (cast is [] and poster only has decks)
}

const g = globalThis as unknown as { __nihaRooms?: Map<string, RoomRecord>; __nihaBus?: EventEmitter; __nihaSb?: SupabaseClient };
const rooms = (g.__nihaRooms ??= new Map<string, RoomRecord>());
export const bus = (g.__nihaBus ??= Object.assign(new EventEmitter(), {}));
bus.setMaxListeners(200);

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const mode: "supabase" | "memory" = SB_URL && SB_KEY ? "supabase" : "memory";
const sb = () => (g.__nihaSb ??= createClient(SB_URL!, SB_KEY!, { auth: { persistSession: false } }));

const toRow = (r: RoomRecord) => ({
  code: r.code, demo: r.demo, pin_hash: r.pinHash, salt: r.salt, version: r.version,
  content_version: r.contentVersion, state: r.state, cast_list: r.cast, poster: r.poster,
  updated_at: new Date(r.updatedAt).toISOString(),
});
const fromRow = (d: any): RoomRecord => ({
  code: d.code, demo: d.demo, pinHash: d.pin_hash, salt: d.salt, version: d.version,
  contentVersion: d.content_version, state: d.state, cast: d.cast_list, poster: d.poster,
  updatedAt: Date.parse(d.updated_at),
});

export async function getRoom(code: string): Promise<RoomRecord | null> {
  if (mode === "memory") return rooms.get(code) ?? null;
  const { data, error } = await sb().from("rooms").select("*").eq("code", code).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromRow(data) : null;
}

const LIGHT_COLS = "code,demo,pin_hash,salt,version,content_version,state,updated_at,decks:poster->decks";
const lightCache = new Map<string, { t: number; r: RoomRecord }>();
/** Small read: everything except photos. Used by polling, commands and login. Cached ~700 ms to absorb many phones. */
export async function getRoomLight(code: string, maxAgeMs = 0): Promise<RoomRecord | null> {
  if (mode === "memory") return rooms.get(code) ?? null;
  const hit = lightCache.get(code);
  if (hit && Date.now() - hit.t < maxAgeMs) return hit.r;
  const { data, error } = await sb().from("rooms").select(LIGHT_COLS).eq("code", code).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const d = data as any;
  const r: RoomRecord = { ...fromRow({ ...d, cast_list: [], poster: {} }), cast: [], poster: { decks: d.decks ?? undefined } as never, light: true };
  lightCache.set(code, { t: Date.now(), r });
  return r;
}

export async function createRoom(r: RoomRecord) {
  if (mode === "memory") {
    if (rooms.size > 300) { // evict oldest
      const oldest = [...rooms.values()].sort((a, b) => a.updatedAt - b.updatedAt)[0];
      if (oldest) rooms.delete(oldest.code);
    }
    rooms.set(r.code, r);
  } else {
    const { error } = await sb().from("rooms").insert(toRow(r));
    if (error) throw new Error(error.message);
  }
}

/** Optimistic-concurrency update: `mutate` is re-run on the fresh record if someone else wrote first. */
export async function updateRoom(code: string, mutate: (r: RoomRecord) => RoomRecord | null, opts: { light?: boolean } = {}): Promise<RoomRecord | null> {
  for (let attempt = 0; attempt < 10; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 25 + Math.random() * 90));
    const cur = opts.light ? await getRoomLight(code) : await getRoom(code);
    if (!cur) return null;
    const next = mutate(structuredClone(cur));
    if (!next) return cur;
    next.updatedAt = Date.now();
    if (mode === "memory") {
      rooms.set(code, next);
      bus.emit(code, next.version);
      return next;
    }
    const patch = opts.light ? { version: next.version, state: next.state, updated_at: new Date(next.updatedAt).toISOString() } : toRow(next);
    const { data, error } = await sb().from("rooms").update(patch).eq("code", code).eq("version", cur.version).select("code");
    if (error) throw new Error(error.message);
    if (data && data.length) { lightCache.delete(code); await broadcast(code, next.version); return next; }
  }
  throw new Error("Could not save (conflict). Try again.");
}

/** Tiny ping over Supabase Realtime Broadcast. Clients then re-fetch the (authoritative) state. */
async function broadcast(code: string, version: number) {
  try {
    await fetch(`${SB_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}` },
      body: JSON.stringify({ messages: [{ topic: `niha-room-${code}`, event: "ping", payload: { v: version }, private: false }] }),
    });
  } catch { /* clients also poll, so a missed ping only delays by a few seconds */ }
}

export function newCode(): string {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O
  return Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join("");
}
