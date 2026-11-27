import { createRoom, getRoom, newCode } from "@/server/store";
import { hashPin, makeToken, newSalt } from "@/server/auth";
import { json } from "@/server/view";
import { demoCast, demoHost, partyCast, partyHost, defaultPoster } from "@/lib/cast";
import { partyDecks } from "@/lib/decks";
import { initialState } from "@/lib/reducer";
export const dynamic = "force-dynamic";

/** Create a room. Demo rooms are throw-away, use fictional data and a fixed PIN (0000). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const demo = !!body.demo;
  const pin = demo ? "0000" : String(body.pin ?? "");
  if (!/^\d{4,8}$/.test(pin)) return json({ error: "PIN must be 4–8 digits." }, 400);
  let code = newCode();
  for (let i = 0; i < 10 && (await getRoom(code)); i++) code = newCode();
  const salt = newSalt();
  const pinHash = hashPin(pin, salt);
  const now = Date.now();
  await createRoom({
    code, demo, pinHash, salt, version: 1, contentVersion: 1, updatedAt: now,
    state: initialState(now), cast: demo ? demoCast() : partyCast(), poster: { ...defaultPoster(demo ? demoHost() : partyHost()), ...(demo ? {} : { decks: partyDecks() }) },
  });
  return json({ code, token: makeToken(code, pinHash), demo });
}
