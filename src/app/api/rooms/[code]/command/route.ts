import { getRoom, updateRoom } from "@/server/store";
import { isHost, json, normCode, toView } from "@/server/view";
import { reduce } from "@/lib/reducer";
import type { Command } from "@/lib/types";
export const dynamic = "force-dynamic";

const TYPES = ["next","prev","goto","openPoster","replayOpening","startCast","bombshell","restart","standby","togglePause","toggleMute","enter"];

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const r0 = await getRoom(code);
  if (!r0) return json({ error: "Room not found" }, 404);
  const cmd = (await req.json().catch(() => null)) as Command | null;
  if (!cmd || !TYPES.includes(cmd.type)) return json({ error: "Bad command" }, 400);
  // The only public command is the TV's own ENTER THE VILLA button (poster → first islander).
  if (cmd.type !== "enter" && !isHost(req, r0)) return json({ error: "Host PIN required" }, 401);
  if (cmd.type === "goto" && !Number.isInteger(cmd.step)) return json({ error: "Bad step" }, 400);
  const r = await updateRoom(code, (rec) => {
    const state = reduce(rec.state, cmd);
    if (JSON.stringify(state) === JSON.stringify(rec.state)) return null;
    return { ...rec, state, version: rec.version + 1 };
  });
  return json(toView(r!, Number(new URL(req.url).searchParams.get("cv") ?? -1)));
}
