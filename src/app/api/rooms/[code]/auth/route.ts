import { getRoom } from "@/server/store";
import { hashPin, isBlocked, makeToken, pinThrottle, safeEqual } from "@/server/auth";
import { json, normCode } from "@/server/view";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const key = `${code}|${req.headers.get("x-forwarded-for") ?? "local"}`;
  if (isBlocked(key)) return json({ error: "Too many attempts. Wait a few minutes." }, 429);
  const r = await getRoom(code);
  if (!r) return json({ error: "Room not found" }, 404);
  const { pin } = await req.json().catch(() => ({ pin: "" }));
  if (!safeEqual(hashPin(String(pin ?? ""), r.salt), r.pinHash)) {
    pinThrottle(key, true);
    return json({ error: "Wrong PIN" }, 401);
  }
  pinThrottle(key);
  return json({ token: makeToken(code, r.pinHash), demo: r.demo });
}
