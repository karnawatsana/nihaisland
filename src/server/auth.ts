import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const g = globalThis as unknown as { __nihaSecret?: string; __nihaAttempts?: Map<string, { n: number; t: number }> };
const SECRET = process.env.ROOM_SECRET || (g.__nihaSecret ??= randomBytes(32).toString("hex"));

export const newSalt = () => randomBytes(12).toString("hex");
export const hashPin = (pin: string, salt: string) => scryptSync(pin, salt, 32).toString("hex");
export const makeToken = (code: string, pinHash: string) =>
  createHmac("sha256", SECRET).update(`${code}:${pinHash}`).digest("hex");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Tiny in-process brute-force limiter: 8 wrong PINs / 5 min per room+ip. */
export function pinThrottle(key: string, failed?: boolean): boolean {
  const m = (g.__nihaAttempts ??= new Map());
  const now = Date.now();
  const e = m.get(key);
  if (!e || now - e.t > 5 * 60_000) { if (failed) m.set(key, { n: 1, t: now }); else m.delete(key); return true; }
  if (failed) { e.n++; return e.n <= 8; }
  if (e.n >= 8) return false;
  m.delete(key); return true;
}
export const isBlocked = (key: string) => {
  const e = g.__nihaAttempts?.get(key); return !!e && e.n >= 8 && Date.now() - e.t < 5 * 60_000;
};
