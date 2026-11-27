"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Command, Decks, Islander, PosterConfig, PresState, RoomView } from "./types";
import { norm } from "./reducer";
import { defaultDecks } from "./decks";

export type Status = "connecting" | "live" | "offline" | "missing";
export interface RoomData { code: string; demo: boolean; state: PresState; cast: Islander[]; poster: PosterConfig; decks: Decks; version: number }

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const realtimeMode = SB_URL && SB_ANON ? "supabase" : "sse";
let sbClient: ReturnType<typeof createClient> | null = null; // one shared client (avoids duplicate-auth warnings)
const getSb = () => (sbClient ??= createClient(SB_URL!, SB_ANON!, { auth: { persistSession: false, autoRefreshToken: false } }));

export const tokenKey = (code: string) => `niha:token:${code}`;
export const getToken = (code: string) => { try { return localStorage.getItem(tokenKey(code)); } catch { return null; } };
export const setToken = (code: string, t: string) => { try { localStorage.setItem(tokenKey(code), t); } catch {} };

/**
 * Keeps a room in sync: push (Supabase Realtime broadcast, or SSE in local mode) + 2.5s polling safety net +
 * refetch on tab focus/online. Reconnection is automatic; `status` tells the UI what is happening.
 */
export function useRoom(code: string | null) {
  const [data, setData] = useState<RoomData | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [push, setPush] = useState(false);
  const ref = useRef<{ cv: number; v: number; data: RoomData | null }>({ cv: -1, v: -1, data: null });

  const apply = useCallback((v: RoomView) => {
    const r = ref.current;
    if (v.version < r.v && v.contentVersion <= r.cv) return; // stale
    const cast = v.cast ?? r.data?.cast;
    const poster = v.poster ?? r.data?.poster;
    if (!cast || !poster) return;
    r.cv = v.contentVersion; r.v = v.version;
    r.data = { code: v.code, demo: v.demo, state: norm(v.state), cast, poster, decks: { ...defaultDecks(), ...(poster.decks ?? {}) }, version: v.version };
    setData(r.data);
  }, []);

  const refresh = useCallback(async () => {
    if (!code) return;
    try {
      const res = await fetch(`/api/rooms/${code}?cv=${ref.current.cv}`, { cache: "no-store" });
      if (res.status === 404) { setStatus("missing"); return; }
      if (!res.ok) throw new Error(String(res.status));
      apply(await res.json());
      setStatus("live");
    } catch { setStatus("offline"); }
  }, [code, apply]);

  useEffect(() => {
    if (!code) return;
    ref.current = { cv: -1, v: -1, data: null };
    setData(null); setStatus("connecting");
    refresh();
    const poll = setInterval(refresh, 2500);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", refresh);
    let cleanup = () => {};
    if (realtimeMode === "supabase") {
      const sb = getSb();
      const ch = sb.channel(`niha-room-${code}`)
        .on("broadcast", { event: "ping" }, () => refresh())
        .subscribe((s) => { setPush(s === "SUBSCRIBED"); if (s === "SUBSCRIBED") refresh(); });
      cleanup = () => { sb.removeChannel(ch); };
    } else {
      const es = new EventSource(`/api/rooms/${code}/stream`);
      es.onopen = () => setPush(true);
      es.onmessage = () => refresh();
      es.onerror = () => setPush(false);
      cleanup = () => es.close();
    }
    return () => { clearInterval(poll); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("online", refresh); cleanup(); setPush(false); };
  }, [code, refresh]);

  const send = useCallback(async (cmd: Command): Promise<string | null> => {
    if (!code) return "No room";
    try {
      const tok = getToken(code);
      const res = await fetch(`/api/rooms/${code}/command?cv=${ref.current.cv}`, {
        method: "POST", headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify(cmd),
      });
      const j = await res.json();
      if (!res.ok) return j.error || "Failed";
      apply(j); return null;
    } catch { return "Offline — will work again when the connection returns."; }
  }, [code, apply]);

  const saveContent = useCallback(async (cast: Islander[], poster: PosterConfig): Promise<string | null> => {
    if (!code) return "No room";
    try {
      const res = await fetch(`/api/rooms/${code}/content`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(code) ?? ""}` },
        body: JSON.stringify({ cast, poster }),
      });
      const j = await res.json();
      if (!res.ok) return j.error || "Failed";
      apply(j); return null;
    } catch { return "Offline"; }
  }, [code, apply]);

  return { data, status, push, send, saveContent, refresh };
}

export async function login(code: string, pin: string): Promise<{ token?: string; demo?: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/rooms/${code.toUpperCase().trim()}/auth`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }),
    });
    const j = await res.json();
    if (!res.ok) return { error: j.error || "Login failed" };
    setToken(code.toUpperCase().trim(), j.token);
    return j;
  } catch { return { error: "Can't reach the server" }; }
}

export async function createRoomApi(opts: { demo?: boolean; pin?: string }): Promise<{ code?: string; token?: string; error?: string }> {
  try {
    const res = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opts) });
    const j = await res.json();
    if (!res.ok) return { error: j.error };
    setToken(j.code, j.token);
    return j;
  } catch { return { error: "Can't reach the server" }; }
}
