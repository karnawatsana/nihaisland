"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { HostPanel } from "@/components/HostPanel";
import { Presentation } from "@/components/Presentation";
import { Shell } from "@/components/Shell";
import { createRoomApi, getToken } from "@/lib/useRoom";

const KEY = "niha:demoRoom";

export default function Demo() {
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [qr, setQr] = useState("");

  useEffect(() => {
    (async () => {
      let c: string | null = null; try { c = sessionStorage.getItem(KEY); } catch {}
      if (c && getToken(c)) { const r = await fetch(`/api/rooms/${c}`).catch(() => null); if (r?.ok) { setCode(c); return; } }
      setCode(null);
    })();
  }, []);
  useEffect(() => { if (code) QRCode.toDataURL(`${location.origin}/host?room=${code}&pin=0000`, { margin: 1, width: 260 }).then(setQr); }, [code]);

  const launch = async () => {
    setBusy(true); setErr("");
    const r = await createRoomApi({ demo: true }); setBusy(false);
    if (r.error || !r.code) { setErr(r.error || "Could not start the demo"); return; }
    try { sessionStorage.setItem(KEY, r.code); } catch {}
    setCode(r.code);
  };

  if (code === undefined) return <Shell><div className="p-10 text-center">…</div></Shell>;
  if (!code) {
    return (
      <Shell>
        <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-[.4em]">Demo mode</div>
          <h1 className="title-pink text-7xl font-extrabold leading-none sm:text-8xl">niha island</h1>
          <p className="mt-6 text-lg text-white/95 drop-shadow">Try the whole show with <b>fictional characters</b> and sample data: title poster, cast introductions, the Birthday Bombshell, and a phone remote that controls the TV in real time.</p>
          <p className="mt-2 text-sm text-white/80">Demo rooms are completely separate from your real party room.</p>
          <button onClick={launch} disabled={busy} className="mt-8 rounded-full bg-gradient-to-br from-hot to-[#d4106f] px-12 py-5 text-2xl font-extrabold tracking-[.25em] shadow-2xl shadow-hot/50 transition active:scale-95 disabled:opacity-60">{busy ? "STARTING…" : "LAUNCH DEMO"}</button>
          {err && <div role="alert" className="mt-4 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold">{err}</div>}
          <a href="/" className="mt-8 text-sm underline">← Back</a>
        </div>
      </Shell>
    );
  }
  return (
    <Shell>
      <div className="mx-auto max-w-[1500px] px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><span className="title-pink text-4xl font-extrabold">niha island</span> <span className="ml-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold tracking-[.2em] text-black">DEMO · ROOM {code}</span></div>
          <button className="rounded-full border border-white/50 bg-white/15 px-5 py-2 text-sm font-bold tracking-widest" onClick={() => { try { sessionStorage.removeItem(KEY); } catch {} setCode(null); }}>END DEMO &amp; START OVER</button>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/40 shadow-2xl" data-testid="tv-preview"><Presentation code={code} contained /></div>
            <p className="mt-2 text-xs text-white/80">↑ TV preview (this is exactly what <code>/play</code> shows on the big screen). Click once on it to enable sound.</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/30 bg-[#04283e]/50 backdrop-blur" data-testid="host-preview"><HostPanel code={code} compact /></div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/30 bg-[#04283e]/50 p-3 backdrop-blur">
              {qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="QR code for the demo host remote" width={96} height={96} className="rounded-lg bg-white p-1" />}
              <div className="text-sm"><b>Test with your real phone:</b><br />scan to open the remote (PIN auto-filled for demo).<br /><a className="underline" href={`/play?room=${code}`} target="_blank" rel="noreferrer">Open the TV in another tab / device →</a></div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
