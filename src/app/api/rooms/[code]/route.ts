import { getRoom } from "@/server/store";
import { json, normCode, toView } from "@/server/view";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const r = await getRoom(code);
  if (!r) return json({ error: "Room not found" }, 404);
  const cv = Number(new URL(req.url).searchParams.get("cv") ?? -1);
  return json(toView(r, cv));
}
