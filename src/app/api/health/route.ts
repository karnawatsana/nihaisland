import { mode } from "@/server/store";
import { json } from "@/server/view";
export const dynamic = "force-dynamic";
export const GET = () => json({ ok: true, mode });
