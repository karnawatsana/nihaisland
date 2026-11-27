"use client";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { HostLogin } from "@/components/HostLogin";
import { Poster } from "@/components/Poster";
import { Shell } from "@/components/Shell";
import { Stage } from "@/components/Stage";
import { Silhouette } from "@/components/Silhouette";
import { createRoomApi, getToken, realtimeMode, useRoom } from "@/lib/useRoom";
import { fileToDataUrl } from "@/lib/image";
import { partyCast, partyHost, placeholderCast } from "@/lib/cast";
import { CAST_SIZE } from "@/lib/sequence";
import { defaultDecks, GAME_META } from "@/lib/decks";
import type { Decks } from "@/lib/types";
import type { Islander, PosterConfig } from "@/lib/types";

const KEY = "niha:setupRoom";
const input = "w-full rounded-xl border border-white/35 bg-[#04283e]/60 px-3 py-2 text-[15px] outline-none placeholder:text-white/40 focus:border-gold";
const label = "mb-1 mt-3 block text-[11px] font-semibold uppercase tracking-[.2em] text-white/80";

async function hasTransparency(dataUrl: string): Promise<boolean> {
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
  const c = document.createElement("canvas"); c.width = 64; c.height = 64;
  const x = c.getContext("2d")!; x.drawImage(img, 0, 0, 64, 64);
  const d = x.getImageData(0, 0, 64, 64).data; let t = 0, n = 0;
  for (let i = 0; i < 64; i++) for (const [px, py] of [[i, 0], [i, 63], [0, i], [63, i]]) { n++; if (d[(py * 64 + px) * 4 + 3] < 200) t++; }
  return t / n > 0.5;
}

function CastCard({ c, i, onChange, title }: { c: Islander; i: number; onChange: (c: Islander) => void; title?: string }) {
  const [busy, setBusy] = useState(false);
  const birthday = i === CAST_SIZE - 1;
  return (
    <div className={`rounded-3xl border p-4 backdrop-blur ${birthday ? "border-gold bg-gradient-to-br from-[#ff2d95]/30 to-[#ffb02e]/25" : "border-white/30 bg-[#04283e]/55"}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold uppercase tracking-[.2em]">{title ?? (birthday ? "★ Birthday Bombshell (introduced last)" : `Islander ${i + 1}`)}</div>
        <input type="color" value={c.accent} onChange={(e) => onChange({ ...c, accent: e.target.value })} aria-label="Accent colour" className="h-8 w-10 cursor-pointer rounded bg-transparent" />
      </div>
      <div className="mt-3 flex gap-4">
        <div className="w-28 shrink-0">
          <div className="relative h-40 w-28 overflow-hidden rounded-t-[56px] rounded-b-xl border-2 border-white/60 bg-black/20">
            {c.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.photo} alt="" className={`h-full w-full ${c.photoCutout ? "object-contain" : "object-cover"}`} style={{ objectPosition: c.photoCutout ? "50% 100%" : "50% 22%" }} /> : <Silhouette color={c.accent} />}
          </div>
          <label className="mt-2 block cursor-pointer rounded-lg bg-white/20 px-2 py-2 text-center text-xs font-bold hover:bg-white/30">
            {busy ? "Processing…" : c.photo ? "Replace photo" : "Upload photo"}
            <input type="file" accept="image/*" className="hidden" aria-label={`Upload photo for ${c.firstName}`} onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return; setBusy(true);
              try { const url = await fileToDataUrl(f); onChange({ ...c, photo: url, photoCutout: await hasTransparency(url) }); } finally { setBusy(false); e.target.value = ""; }
            }} />
          </label>
          {c.photo && <button className="mt-1 w-full text-xs underline" onClick={() => onChange({ ...c, photo: null, photoCutout: false })}>Remove</button>}
        </div>
        <div className="min-w-0 flex-1">
          <label className={label} style={{ marginTop: 0 }}>First name</label>
          <input className={input} value={c.firstName} maxLength={28} onChange={(e) => onChange({ ...c, firstName: e.target.value })} />
          <label className={label}>Reality-TV nickname</label>
          <input className={input} value={c.nickname} maxLength={48} onChange={(e) => onChange({ ...c, nickname: e.target.value })} />
        </div>
      </div>
      <label className={label}>Short sarcastic bio</label>
      <textarea className={input} rows={3} maxLength={320} value={c.bio} onChange={(e) => onChange({ ...c, bio: e.target.value })} />
      <label className={label}>One-line quote</label>
      <input className={input} value={c.quote} maxLength={160} onChange={(e) => onChange({ ...c, quote: e.target.value })} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {c.stats.map((s, k) => (
          <div key={k} className="rounded-xl bg-black/20 p-2">
            <input className={`${input} !py-1 text-xs font-semibold`} value={s.label} maxLength={28} aria-label={`Stat ${k + 1} name`} onChange={(e) => onChange({ ...c, stats: c.stats.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })} />
            <div className="mt-1 flex items-center gap-2">
              <input type="range" min={0} max={100} value={s.value} aria-label={`${s.label} value`} className="w-full accent-[#ff2d95]" onChange={(e) => onChange({ ...c, stats: c.stats.map((x, j) => (j === k ? { ...x, value: +e.target.value } : x)) })} />
              <span className="w-8 text-right text-sm font-bold">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Editor({ code, onLogout }: { code: string; onLogout: () => void }) {
  const { data, status, push, saveContent } = useRoom(code);
  const [cast, setCast] = useState<Islander[] | null>(null);
  const [poster, setPoster] = useState<PosterConfig | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"cast" | "poster" | "games" | "connect">("cast");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [qr, setQr] = useState("");
  const [saving, setSaving] = useState(false);
  const loadedCv = useRef(false);
  useEffect(() => { if (data && !loadedCv.current) { loadedCv.current = true; setCast(data.cast); setPoster(data.poster); } }, [data]);
  useEffect(() => { QRCode.toDataURL(`${location.origin}/host?room=${code}`, { margin: 1, width: 240 }).then(setQr); }, [code]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);

  if (!cast || !poster) return <div className="p-10 text-center">{status === "missing" ? "Room not found." : "Loading room…"}</div>;
  const edit = (i: number, c: Islander) => { setCast(cast.map((x, j) => (j === i ? c : x))); setDirty(true); setMsg(null); };
  const editPoster = (p: Partial<PosterConfig>) => { setPoster({ ...poster, ...p }); setDirty(true); setMsg(null); };
  const save = async () => { setSaving(true); const e = await saveContent(cast, poster); setSaving(false); if (e) setMsg({ ok: false, t: e }); else { setDirty(false); setMsg({ ok: true, t: "Saved — the TV and host remote updated." }); } };
  const origin = typeof location !== "undefined" ? location.origin : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-xs font-semibold uppercase tracking-[.3em]">Setup</div><div className="title-pink text-4xl font-extrabold leading-none">niha island</div></div>
        <div className="flex items-center gap-3 text-sm"><span className="rounded-xl bg-white/20 px-4 py-2 text-2xl font-extrabold tracking-[.25em]">{code}</span><button className="underline" onClick={onLogout}>Switch room</button></div>
      </div>
      <div className="mt-5 flex gap-2" role="tablist">
        {(["cast", "poster", "games", "connect"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-[.2em] ${tab === t ? "bg-hot" : "bg-white/15"}`}>{t === "connect" ? "TV & Phone" : t}</button>
        ))}
      </div>

      {tab === "cast" && (
        <>
          <p className="mt-4 max-w-3xl rounded-xl bg-black/25 px-4 py-3 text-sm">Every field is editable. Anything in <b>[BRACKETS]</b> is a placeholder and will show on the TV as-is. Order is fixed: the host first, then seven islanders, then Niha as the Birthday Bombshell. Photos are resized in your browser before upload.</p>
          <label className="mt-4 inline-block cursor-pointer rounded-xl bg-gradient-to-br from-hot to-[#d4106f] px-5 py-3 text-sm font-bold">
            ⚡ Bulk import photos (name each file after the islander, e.g. <code>sana.png</code>)
            <input type="file" accept="image/*" multiple className="hidden" aria-label="Bulk import photos" onChange={async (e) => {
              const files = [...(e.target.files ?? [])]; e.target.value = "";
              const next = [...cast]; const hit: string[] = []; const miss: string[] = []; let hostPhoto: Partial<Islander> | null = null;
              for (const f of files) {
                const base = f.name.toLowerCase().replace(/\.[a-z0-9]+$/, "");
                const m = (c: Islander) => { const n = c.firstName.toLowerCase().replace(/[^a-z]/g, ""); return !!n && base.startsWith(n); };
                const url = f.size ? await fileToDataUrl(f) : "";
                if (poster.host && m(poster.host)) { hostPhoto = { photo: url, photoCutout: await hasTransparency(url) }; hit.push(poster.host.firstName); continue; }
                const i = next.findIndex(m);
                if (i < 0) { miss.push(f.name); continue; }
                next[i] = { ...next[i], photo: url, photoCutout: await hasTransparency(url) }; hit.push(next[i].firstName);
              }
              setCast(next); if (hostPhoto && poster.host) setPoster({ ...poster, host: { ...poster.host, ...hostPhoto } }); setDirty(hit.length > 0 || dirty);
              setMsg({ ok: miss.length === 0, t: `Matched: ${hit.join(", ") || "none"}.${miss.length ? ` No islander found for: ${miss.join(", ")}.` : ""} Press Save to push to the TV.` });
            }} />
          </label>
          <div className="mt-4">{poster.host ? <CastCard c={poster.host} i={-1} title="🎤 Host (introduced first)" onChange={(h) => editPoster({ host: h })} /> : <button className="rounded-xl bg-white/20 px-4 py-3 text-sm font-bold" onClick={() => editPoster({ host: partyHost() })}>+ Add a host intro card</button>}</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">{cast.map((c, i) => <CastCard key={c.id} c={c} i={i} onChange={(n) => edit(i, n)} />)}</div>
          <div className="mt-6 flex gap-6 text-sm"><button className="underline" onClick={() => { if (confirm("Reload the written intros? Photos and edits on screen are replaced (unsaved until you press Save).")) { setCast(partyCast()); editPoster({ host: partyHost() }); } }}>Reload written intros</button><button className="underline" onClick={() => { if (confirm("Reset all eight profiles to blank placeholders?")) { setCast(placeholderCast()); setDirty(true); } }}>Reset to blank placeholders</button></div>
        </>
      )}

      {tab === "poster" && (
        <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/40 shadow-2xl" data-testid="poster-preview"><Stage contained><Poster config={poster} still demo={data?.demo} /></Stage></div>
          <div className="rounded-3xl border border-white/30 bg-[#04283e]/55 p-4 backdrop-blur">
            <div className="text-sm font-extrabold uppercase tracking-[.2em]">Niharika&apos;s portrait</div>
            <p className="mt-2 text-sm text-white/85">Best: a <b>transparent PNG/WebP</b> (background removed) of her from the waist up, facing slightly right. Any normal photo also works — it gets a soft vignette. To remove a background for free, try Adobe Express&apos;s or Photoroom&apos;s background remover, then upload the result here.</p>
            <label className="mt-3 block cursor-pointer rounded-xl bg-gradient-to-br from-hot to-[#d4106f] px-4 py-3 text-center font-bold">
              {poster.portrait ? "Replace portrait" : "Upload portrait"}
              <input type="file" accept="image/*" className="hidden" aria-label="Upload poster portrait" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = await fileToDataUrl(f, 1400, 1100); editPoster({ portrait: url, cutout: await hasTransparency(url) }); e.target.value = "";
              }} />
            </label>
            {poster.portrait && <p className="mt-2 text-xs text-white/80">{poster.cutout ? "✓ Transparent edges detected — used as a cut-out." : "No transparency detected — using the soft-vignette fallback."} <button className="underline" onClick={() => editPoster({ portrait: null, cutout: false })}>Remove</button></p>}
            {([["x", "Move left / right", -600, 600, 1], ["y", "Move up / down", -300, 700, 1], ["scale", "Size", 0.4, 1.8, 0.01]] as const).map(([k, l, mn, mx, st]) => (
              <div key={k}><label className={label}>{l}: {poster[k]}</label><input type="range" className="w-full accent-[#ff2d95]" min={mn} max={mx} step={st} value={poster[k]} aria-label={l} onChange={(e) => editPoster({ [k]: +e.target.value })} /></div>
            ))}
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={poster.flip} onChange={(e) => editPoster({ flip: e.target.checked })} /> Mirror image</label>
            <button className="mt-3 text-sm underline" onClick={() => editPoster({ x: 0, y: 0, scale: 1, flip: false })}>Reset position</button>
          </div>
        </div>
      )}

      {tab === "games" && (() => {
        const decks: Decks = { ...defaultDecks(), ...(poster.decks ?? {}) };
        const setDeck = (d: Partial<Decks>) => editPoster({ decks: { ...decks, ...d } });
        const ta = (key: "canceled" | "redflag" | "exposed" | "hotseat" | "awards", title: string, hint: string) => (
          <div className="rounded-3xl border border-white/30 bg-[#04283e]/55 p-4 backdrop-blur" key={key}>
            <div className="text-sm font-extrabold uppercase tracking-[.15em]">{title}</div>
            <p className="mt-1 text-xs text-white/80">{hint} · {decks[key].filter((x) => x.trim()).length} cards</p>
            <textarea aria-label={title} rows={9} className={`${input} mt-2 font-mono text-sm`} value={decks[key].join("\n")} onChange={(e) => setDeck({ [key]: e.target.value.split("\n") })} />
          </div>
        );
        return (
          <div className="mt-4">
            <p className="max-w-3xl rounded-xl bg-black/25 px-4 py-3 text-sm">One card per line, in the order they&apos;ll appear. The starter cards are generic and silly — swap in your real inside jokes!</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/30 bg-[#04283e]/55 p-4 backdrop-blur">
                <div className="text-sm font-extrabold uppercase tracking-[.15em]">{GAME_META.receipts.icon} {GAME_META.receipts.title}</div>
                <p className="mt-2 text-sm text-white/85">Round 1 has no deck to edit: it&apos;s built live from what the guests send in (one true + one fake statement each). On the night, everyone scans the QR shown on the TV during the round 1 intro.</p>
              </div>
              {ta("canceled", `${GAME_META.canceled.icon} Most likely to get canceled for…`, "Finish the sentence: “Most likely to get canceled for …”")}
              {ta("redflag", `${GAME_META.redflag.icon} Red flag or just a personality?`, "A quirk or habit to judge")}
              {ta("exposed", `${GAME_META.exposed.icon} Never have I ever…`, "Finish the sentence: “Never have I ever …”")}
              {ta("awards", "🏆 Villa Awards categories", "One award per line — voted live on phones, in this order")}
              {ta("hotseat", "🔥 Hot Seat questions", "Asked at random when you hit the Hot Seat button")}
            </div>
            <button className="mt-5 text-sm underline" onClick={() => { if (confirm("Replace all game cards with the starter set? (Unsaved until you press Save.)")) editPoster({ decks: defaultDecks() }); }}>Reset to starter cards</button>
          </div>
        );
      })()}

      {tab === "connect" && (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/30 bg-[#04283e]/55 p-5 backdrop-blur">
            <h3 className="text-lg font-extrabold">1 · TV</h3>
            <p className="mt-1 text-sm text-white/85">Open this on the big screen (full-screen the browser, press F11):</p>
            <a className="mt-2 block break-all rounded-lg bg-black/30 p-2 text-sm underline" href={`${origin}/play?room=${code}`} target="_blank" rel="noreferrer">{origin}/play?room={code}</a>
            <h3 className="mt-5 text-lg font-extrabold">2 · Host phone</h3>
            <p className="mt-1 text-sm text-white/85">Scan, then enter your PIN:</p>
            <div className="mt-2 flex items-center gap-4">{qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="Host remote QR code" width={140} height={140} className="rounded-lg bg-white p-1" />}<a className="break-all text-sm underline" href={`${origin}/host?room=${code}`} target="_blank" rel="noreferrer">{origin}/host?room={code}</a></div>
          </div>
          <div className="rounded-3xl border border-white/30 bg-[#04283e]/55 p-5 text-sm backdrop-blur">
            <h3 className="text-lg font-extrabold">Sync status</h3>
            <ul className="mt-2 space-y-1.5">
              <li>Connection: <b>{status}</b></li>
              <li>Push channel: <b>{realtimeMode === "supabase" ? "Supabase Realtime (broadcast)" : "Server-Sent Events (local server mode)"}</b> — {push ? "connected" : "not connected (falling back to 2.5 s polling)"}</li>
              <li>Host PIN: set when the room was created (not recoverable — create a new room if lost).</li>
            </ul>
            {realtimeMode === "sse" && <p className="mt-3 rounded-lg bg-amber-300/90 p-2 font-semibold text-black">Local server mode: state lives in server memory. Fine on your laptop/LAN; on Vercel you must configure Supabase (see README).</p>}
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/30 bg-[#031c2c]/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="text-sm" role="status">{msg ? <span className={msg.ok ? "text-emerald-300" : "text-red-300"}>{msg.t}</span> : dirty ? <span className="text-amber-300">● Unsaved changes</span> : <span className="text-white/70">All changes saved</span>}</div>
          <button onClick={save} disabled={!dirty || saving} className="rounded-full bg-gradient-to-br from-hot to-[#d4106f] px-8 py-3 font-extrabold tracking-[.15em] disabled:opacity-40">{saving ? "SAVING…" : "SAVE & PUSH TO TV"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Setup() {
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<string>("");
  useEffect(() => {
    let c: string | null = null; try { c = localStorage.getItem(KEY); } catch {}
    setCode(c && getToken(c) ? c : null);
    fetch("/api/health").then((r) => r.json()).then((j) => setMode(j.mode)).catch(() => {});
  }, []);
  const done = (c: string) => { try { localStorage.setItem(KEY, c); localStorage.setItem("niha:hostRoom", c); localStorage.setItem("niha:tvRoom", c); } catch {} setCode(c); };
  if (code === undefined) return <Shell><div className="p-10 text-center">…</div></Shell>;
  return (
    <Shell>
      {code ? <Editor code={code} onLogout={() => { try { localStorage.removeItem(KEY); } catch {} setCode(null); }} /> : (
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-8">
          <div className="text-center"><div className="text-xs font-semibold uppercase tracking-[.4em]">Party setup</div><h1 className="title-pink text-6xl font-extrabold leading-none">niha island</h1>
            {mode && <p className="mt-2 text-xs font-semibold uppercase tracking-[.2em] text-white/85">Sync backend: {mode === "supabase" ? "Supabase ✓" : "local server memory"}</p>}</div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <form className="rounded-3xl border border-white/30 bg-[#04283e]/60 p-6 backdrop-blur" onSubmit={async (e) => {
              e.preventDefault(); setBusy(true); setErr(""); const r = await createRoomApi({ pin }); setBusy(false); if (r.error || !r.code) setErr(r.error || "Failed"); else done(r.code);
            }}>
              <h2 className="text-xl font-extrabold">Create the party room</h2>
              <p className="mt-1 text-sm text-white/85">Choose a 4–8 digit host PIN. You&apos;ll get a 4-letter room code.</p>
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" type="password" maxLength={8} placeholder="Host PIN" aria-label="New host PIN" className="mt-4 w-full rounded-xl border border-white/40 bg-white/15 px-4 py-3 text-center text-2xl font-extrabold tracking-[.4em] outline-none placeholder:text-base placeholder:tracking-normal placeholder:text-white/40" />
              {err && <div role="alert" className="mt-3 rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold">{err}</div>}
              <button disabled={busy || pin.length < 4} className="mt-4 w-full rounded-2xl bg-gradient-to-br from-hot to-[#d4106f] py-3 font-bold tracking-[.2em] disabled:opacity-50">{busy ? "…" : "CREATE ROOM"}</button>
            </form>
            <HostLogin title="Open an existing room" onDone={done} />
          </div>
          <p className="mt-6 text-center text-sm"><a className="underline" href="/demo">Want to try it first? Launch the demo →</a></p>
        </div>
      )}
    </Shell>
  );
}
