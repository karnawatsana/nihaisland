import { getRoom, updateRoom } from "@/server/store";
import { isHost, json, normCode, toView } from "@/server/view";
import { norm, reduce } from "@/lib/reducer";
import { defaultDecks } from "@/lib/decks";
import type { Command } from "@/lib/types";
export const dynamic = "force-dynamic";

const TYPES = ["next","prev","goto","openPoster","replayOpening","startCast","bombshell","restart","standby","togglePause","toggleMute","enter","gnext","gprev","mark","verdict","hotStart","hotEnd","finale","pv","vote"];

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const r0 = await getRoom(code);
  if (!r0) return json({ error: "Room not found" }, 404);
  const cmd = (await req.json().catch(() => null)) as Command | null;
  if (!cmd || !TYPES.includes(cmd.type)) return json({ error: "Bad command" }, 400);
  // The only public command is the TV's own ENTER THE VILLA button (poster → first islander).
  if (cmd.type !== "enter" && cmd.type !== "vote" && !isHost(req, r0)) return json({ error: "Host PIN required" }, 401);
  if (cmd.type === "goto" && !Number.isInteger(cmd.step)) return json({ error: "Bad step" }, 400);
  if (cmd.type === "vote" && (!Number.isInteger(cmd.voter) || (typeof cmd.choice !== "string" && typeof cmd.choice !== "number"))) return json({ error: "Bad vote" }, 400);
  if (cmd.type === "pv" && typeof cmd.on !== "boolean") return json({ error: "Bad flag" }, 400);
  const isIdx = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 8;
  if (cmd.type === "mark" && !isIdx(cmd.who)) return json({ error: "Bad islander" }, 400);
  if (cmd.type === "hotStart" && (!isIdx(cmd.who) || !Number.isInteger(cmd.q) || cmd.q < 0)) return json({ error: "Bad hot seat" }, 400);
  if (cmd.type === "verdict" && cmd.v !== "red" && cmd.v !== "ok") return json({ error: "Bad verdict" }, 400);
  if (cmd.type === "finale" && cmd.stage !== 0 && cmd.stage !== 1) return json({ error: "Bad stage" }, 400);
  const r = await updateRoom(code, (rec) => {
    const d = rec.poster.decks ?? defaultDecks();
    const ctx = { lens: { receipts: d.receipts.length, canceled: d.canceled.length, redflag: d.redflag.length, exposed: d.exposed.length } };
    const state = reduce(rec.state, cmd, Date.now(), ctx);
    if (JSON.stringify(state) === JSON.stringify(norm(rec.state))) return null;
    return { ...rec, state, version: rec.version + 1 };
  });
  return json(toView(r!, Number(new URL(req.url).searchParams.get("cv") ?? -1)));
}
