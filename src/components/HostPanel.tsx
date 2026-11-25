"use client";
import { useState } from "react";
import { useRoom, type Status } from "@/lib/useRoom";
import { CAST_SIZE, ROUNDS, STEP, STEPS, stepLabel } from "@/lib/sequence";
import type { Command } from "@/lib/types";

const dot: Record<Status, string> = { live: "bg-emerald-400", connecting: "bg-amber-400", offline: "bg-red-500", missing: "bg-red-500" };
const buzz = () => { try { navigator.vibrate?.(18); } catch {} };

function Btn({ children, onClick, className = "", disabled = false }: { children: React.ReactNode; onClick: () => void; className?: string; disabled?: boolean }) {
  return <button disabled={disabled} onClick={() => { buzz(); onClick(); }} className={`rounded-2xl px-3 py-4 text-[15px] font-bold leading-tight tracking-wide transition active:scale-[.96] disabled:opacity-40 ${className}`}>{children}</button>;
}

export function HostPanel({ code, onLogout, compact = false }: { code: string; onLogout?: () => void; compact?: boolean }) {
  const { data, status, push, send } = useRoom(code);
  const [err, setErr] = useState<string | null>(null);
  const run = async (c: Command) => { setErr(null); const e = await send(c); if (e) setErr(e); };
  if (!data) return <div className="p-8 text-center text-white/80">{status === "missing" ? "Room not found." : "Connecting to the villa…"}</div>;
  const { state, cast } = data;
  const step = STEPS[state.step];
  const pct = Math.round((state.step / STEP.lastStep) * 100);
  const live = status === "live";
  return (
    <div className={`mx-auto w-full max-w-md ${compact ? "px-3 pb-6 pt-3" : "px-4 pb-10 pt-4"}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[.3em] text-white/70">Host remote{data.demo ? " · demo" : ""}</div>
          <div className="title-pink text-3xl font-extrabold leading-none">niha island</div>
        </div>
        <div className="text-right">
          <div className="rounded-xl bg-white/15 px-3 py-1 text-xl font-extrabold tracking-[.2em]" aria-label="Room code">{code}</div>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-xs font-semibold text-white/90"><span className={`inline-block h-2.5 w-2.5 rounded-full ${dot[status]} ${live ? "" : "animate-pulse"}`} />{live ? (push ? "Live · push" : "Live · polling") : status === "offline" ? "Reconnecting…" : "Connecting…"}</div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/30 bg-[#04283e]/60 p-4 backdrop-blur">
        <div className="text-[11px] font-semibold uppercase tracking-[.3em] text-gold">Now on TV{state.paused ? " · PAUSED" : ""}{state.muted ? " · MUTED" : ""}</div>
        <div className="mt-1 text-xl font-bold leading-snug" data-testid="now-showing">{stepLabel(state.step, cast)}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-hot to-gold transition-all" style={{ width: `${pct}%` }} /></div>
        <div className="mt-1 text-right text-xs text-white/70">Step {state.step + 1} / {STEPS.length}</div>
      </div>

      {err && <div role="alert" className="mt-3 rounded-xl bg-red-500/90 px-3 py-2 text-sm font-semibold">{err}</div>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn onClick={() => run({ type: "prev" })} disabled={state.step === 0} className="bg-white/20 py-6 text-lg ring-1 ring-white/40">◀ BACK</Btn>
        <Btn onClick={() => run({ type: "next" })} disabled={state.step === STEP.lastStep} className="bg-gradient-to-br from-hot to-[#d4106f] py-6 text-lg shadow-lg shadow-hot/40">NEXT ▶</Btn>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Btn onClick={() => run({ type: "replayOpening" })} className="bg-white/15 ring-1 ring-white/30">🎬 Opening animation</Btn>
        <Btn onClick={() => run({ type: "openPoster" })} className="bg-white/15 ring-1 ring-white/30">🖼 Show poster</Btn>
        <Btn onClick={() => run({ type: "startCast" })} className="bg-white/15 ring-1 ring-white/30">👥 Start introductions</Btn>
        <Btn onClick={() => run({ type: "bombshell" })} className="bg-gradient-to-br from-[#ffb02e] to-[#ff2d95] ring-1 ring-white/40">💣 Birthday Bombshell</Btn>
        <Btn onClick={() => run({ type: "togglePause" })} className={state.paused ? "bg-amber-400 text-black" : "bg-white/15 ring-1 ring-white/30"}>{state.paused ? "▶ Resume" : "⏸ Pause"}</Btn>
        <Btn onClick={() => run({ type: "toggleMute" })} className={state.muted ? "bg-amber-400 text-black" : "bg-white/15 ring-1 ring-white/30"}>{state.muted ? "🔇 Unmute effects" : "🔊 Mute effects"}</Btn>
        <Btn onClick={() => run({ type: "restart" })} className="bg-white/15 ring-1 ring-white/30">🔄 Restart intro</Btn>
        <Btn onClick={() => run({ type: "standby" })} className="bg-white/15 ring-1 ring-white/30">📺 Standby screen</Btn>
      </div>

      <details className="mt-5 rounded-2xl border border-white/25 bg-white/10 p-3" open={!compact}>
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-[.2em]">Jump to…</summary>
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[.25em] text-white/70">Islanders</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {cast.slice(0, CAST_SIZE - 1).map((c, i) => (
            <button key={c.id} onClick={() => { buzz(); run({ type: "goto", step: STEP.firstCast + i }); }} className={`truncate rounded-xl px-3 py-2 text-left text-sm font-semibold ${state.step === STEP.firstCast + i ? "bg-hot" : "bg-white/15"}`}>
              <span className="mr-1 opacity-70">{i + 1}.</span>{c.firstName}
            </button>
          ))}
          <button onClick={() => { buzz(); run({ type: "bombshell" }); }} className={`truncate rounded-xl px-3 py-2 text-left text-sm font-semibold ${step.kind === "bombshell" ? "bg-hot" : "bg-gradient-to-r from-[#ffb02e]/60 to-[#ff2d95]/60"}`}>★ {cast[CAST_SIZE - 1].firstName}</button>
        </div>
        <div className="mt-4 text-[11px] font-semibold uppercase tracking-[.25em] text-white/70">Rounds (Phase 2 placeholders)</div>
        <div className="mt-2 grid gap-2">
          {ROUNDS.map((r, i) => (
            <button key={r.id} onClick={() => { buzz(); run({ type: "goto", step: STEP.bombshell + 1 + i }); }} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${state.step === STEP.bombshell + 1 + i ? "bg-hot" : "bg-white/15"}`}>{r.icon} {r.n}. {r.title}</button>
          ))}
          <button onClick={() => run({ type: "goto", step: STEP.lastStep - 1 })} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${step.kind === "hotseat" ? "bg-hot" : "bg-white/15"}`}>🔥 Hot Seat interruption</button>
          <button onClick={() => run({ type: "goto", step: STEP.lastStep })} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${step.kind === "finale" ? "bg-hot" : "bg-white/15"}`}>🎂 Birthday finale</button>
        </div>
      </details>

      <div className="mt-5 flex items-center justify-between text-sm text-white/80">
        {!compact && <a className="underline" href={`/setup`}>Setup</a>}
        <a className="underline" href={`/play?room=${code}`} target="_blank" rel="noreferrer">Open TV page</a>
        {onLogout && <button className="underline" onClick={onLogout}>Log out</button>}
      </div>
    </div>
  );
}
