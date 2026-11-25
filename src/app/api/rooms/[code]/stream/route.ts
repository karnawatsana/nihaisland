import { bus, getRoom, mode } from "@/server/store";
import { normCode } from "@/server/view";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Server-Sent Events push channel used in local (no-Supabase) mode. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  if (mode !== "memory") return new Response("SSE is only used without Supabase", { status: 404 });
  const r = await getRoom(code);
  if (!r) return new Response("not found", { status: 404 });
  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(ctrl) {
      const send = (v: number) => { try { ctrl.enqueue(enc.encode(`data: ${v}\n\n`)); } catch {} };
      send(r.version);
      bus.on(code, send);
      const hb = setInterval(() => { try { ctrl.enqueue(enc.encode(`: hb\n\n`)); } catch {} }, 15000);
      cleanup = () => { bus.off(code, send); clearInterval(hb); try { ctrl.close(); } catch {} };
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
