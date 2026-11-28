import { getRoom, getRoomLight } from "@/server/store";
import { json, normCode, toView } from "@/server/view";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const cv = Number(new URL(req.url).searchParams.get("cv") ?? -1);
  // Polling with up-to-date photos only needs the small state row.
  let r = await getRoomLight(code, 700);
  if (!r) return json({ error: "Room not found" }, 404);
  if (r.contentVersion !== cv) r = await getRoom(code); // photos changed (or first load): fetch everything once
  if (!r) return json({ error: "Room not found" }, 404);
  return json(toView(r, cv));
}
