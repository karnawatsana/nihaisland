import type { RoomRecord } from "./store";
import type { RoomView } from "@/lib/types";
import { makeToken, safeEqual } from "./auth";

/** Clients never receive which statement was fake until that card has been revealed. */
function publicState(st: RoomRecord["state"]): RoomRecord["state"] {
  const subs: Record<string, { a: string; b: string; fake?: "A" | "B" }> = {};
  const rev = st.rev ?? [];
  Object.entries(st.subs ?? {}).forEach(([k, v]) => { subs[k] = rev.includes(+k) ? v : { a: v.a, b: v.b }; });
  return { ...st, subs };
}
export function toView(r: RoomRecord, knownContent = -1): RoomView {
  return {
    code: r.code, demo: r.demo, version: r.version, contentVersion: r.contentVersion,
    state: publicState(r.state), serverTime: Date.now(),
    ...(knownContent !== r.contentVersion ? { cast: r.cast, poster: r.poster } : {}),
  };
}
export function isHost(req: Request, r: RoomRecord): boolean {
  const t = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return !!t && safeEqual(t, makeToken(r.code, r.pinHash));
}
export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const normCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
