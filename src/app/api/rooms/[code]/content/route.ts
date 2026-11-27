import { getRoom, updateRoom } from "@/server/store";
import { isHost, json, normCode, toView } from "@/server/view";
import { CAST_SIZE } from "@/lib/sequence";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);
const img = (v: unknown) => (typeof v === "string" && v.startsWith("data:image/") && v.length < 2_500_000 ? v : null);

export async function PUT(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const r0 = await getRoom(code);
  if (!r0) return json({ error: "Room not found" }, 404);
  if (!isHost(req, r0)) return json({ error: "Host PIN required" }, 401);
  const b = await req.json().catch(() => null);
  if (!b || !Array.isArray(b.cast) || b.cast.length !== CAST_SIZE) return json({ error: "Cast must have 8 entries" }, 400);
  const clean = (c: any, i: number, birthday = false) => ({
    id: str(c.id, 20) || `c${i}`,
    firstName: str(c.firstName, 28), nickname: str(c.nickname, 48), bio: str(c.bio, 320), quote: str(c.quote, 160),
    accent: /^#[0-9a-f]{6}$/i.test(c.accent) ? c.accent : "#ff2d95",
    photo: img(c.photo), photoCutout: !!c.photoCutout, birthday,
    stats: (Array.isArray(c.stats) ? c.stats : []).slice(0, 4).map((s: any) => ({
      label: str(s.label, 28), value: Math.max(0, Math.min(100, Math.round(Number(s.value) || 0))),
    })),
  });
  const lines = (v: unknown, max = 60): string[] => (Array.isArray(v) ? v : []).slice(0, max).map((x) => str(x, 220).trim()).filter(Boolean);
  const dk = b.poster?.decks;
  const decks = dk ? {
    receipts: (Array.isArray(dk.receipts) ? dk.receipts : []).slice(0, 60).map((x: any) => ({ q: str(x?.q, 220).trim(), reveal: str(x?.reveal, 220).trim() })).filter((x: any) => x.q),
    canceled: lines(dk.canceled), redflag: lines(dk.redflag), exposed: lines(dk.exposed), hotseat: lines(dk.hotseat), awards: lines(dk.awards),
  } : undefined;
  const cast = b.cast.map((c: any, i: number) => clean(c, i, i === CAST_SIZE - 1));
  const p = b.poster ?? {};
  const poster = {
    portrait: img(p.portrait), x: Number(p.x) || 0, y: Number(p.y) || 0,
    scale: Math.max(0.3, Math.min(2.5, Number(p.scale) || 1)), flip: !!p.flip, cutout: !!p.cutout,
    host: p.host ? clean(p.host, 99) : undefined,
    decks,
  };
  const r = await updateRoom(code, (rec) => ({
    ...rec, cast, poster, version: rec.version + 1, contentVersion: rec.contentVersion + 1,
  }));
  return json(toView(r!, -1));
}
