"use client";
import { useState } from "react";
import { useRoom, type Status } from "@/lib/useRoom";
import { CAST_SIZE, ROUNDS, STEP, STEPS, introStep, stepLabel } from "@/lib/sequence";
import { GAME_META } from "@/lib/decks";
import { authorsOf } from "@/lib/receipts";
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
        <div className="mt-1 text-xl font-bold leading-snug" data-testid="now-showing">{stepLabel(state.step, cast, data.poster.host?.firstName)}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-hot to-gold transition-all" style={{ width: `${pct}%` }} /></div>
        <div className="mt-1 text-right text-xs text-white/70">Step {state.step + 1} / {STEPS.length}</div>
      </div>

      {step.kind === "roundIntro" && (
        <div className="mt-4 rounded-3xl border border-white/30 bg-[#04283e]/60 p-4 backdrop-blur" data-testid="intro-panel">
          <div className="text-[11px] font-semibold uppercase tracking-[.25em] text-gold">{GAME_META[step.id].icon} Intro · explain the rules</div>
          <p className="mt-2 text-sm text-white/90">The TV is showing how this round works. Read it out, then start the game.</p>
          {step.id === "awards" ? <p className="mt-3 rounded-xl bg-emerald-500/20 p-2 text-xs font-bold text-emerald-200">📱 Awards are voted live on phones. Let everyone scan the QR and pick their name first.</p> : <button onClick={() => { buzz(); run({ type: "pv", on: !state.pv }); }} className={`mt-3 w-full rounded-xl py-2.5 text-sm font-extrabold ${state.pv ? "bg-emerald-500" : "bg-white/20"}`}>📱 Phone voting: {state.pv ? "ON" : "OFF"}</button>}
          {step.id === "receipts" && (() => {
            const ppl = [...cast.slice(0, CAST_SIZE), ...(data.poster.host ? [data.poster.host] : [])];
            const have = Object.keys(state.subs).length; const missing = ppl.filter((_, i) => !state.subs[String(i)]);
            return <div className="mt-3 rounded-2xl bg-black/25 p-3 text-sm" data-testid="subs-status"><b>🧾 {have} / {ppl.length} sent their statements</b>{missing.length > 0 && have > 0 ? <div className="mt-1 text-xs text-white/80">Waiting on: {missing.map((m) => m.firstName.replace(/[\[\]]/g, "")).join(", ")}</div> : null}<div className="mt-1 text-xs text-white/75">The QR on the TV lets everyone send theirs. You can start anytime — only people who sent get a card.</div></div>;
          })()}
          {state.pv && <p className="mt-2 text-xs text-white/80">The QR is on the TV — let everyone scan &amp; pick their name <b>before</b> you start.</p>}
          <button onClick={() => { buzz(); run({ type: "next" }); }} className="mt-3 w-full rounded-2xl bg-gradient-to-br from-hot to-[#d4106f] py-5 text-lg font-extrabold shadow-lg shadow-hot/40 active:scale-[.97]">START THE GAME ▶</button>
        </div>
      )}

      {step.kind === "round" && (() => {
        const id = step.id; const meta = GAME_META[id];
        const ppl = [...cast.slice(0, CAST_SIZE), ...(data.poster.host ? [data.poster.host] : [])];
        const authors = authorsOf(state.subs);
        const list: string[] = id === "receipts" ? authors.map((a) => `${(ppl[a]?.firstName ?? "?").replace(/[\[\]]/g, "")}: A) ${state.subs[String(a)].a}  ·  B) ${state.subs[String(a)].b}`) : data.decks[id];
        const idx = Math.min(state.card, Math.max(list.length - 1, 0));
        const last = idx >= list.length - 1 && state.beat >= 2;
        const picks = id === "canceled" || id === "exposed" ? state.res[id][String(idx)] ?? [] : [];
        const verdict = id === "redflag" ? state.res.redflag[String(idx)] : undefined;
        return (
          <div className="mt-4 rounded-3xl border border-white/30 bg-[#04283e]/60 p-4 backdrop-blur" data-testid="game-panel">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.25em] text-gold"><span>{meta.icon} Card {idx + 1} / {list.length}</span><span>Step {state.beat + 1} / 3</span></div>
            <div className="mt-2 text-base font-semibold leading-snug text-white/95">{list[idx] ?? "(empty deck)"}</div>
            {(() => {
              const voters = [...cast.slice(0, CAST_SIZE), ...(data.poster.host ? [data.poster.host] : [])];
              const cv = state.votes[`${id}:${idx}`] ?? {}; const missing = voters.filter((_, i) => cv[String(i)] === undefined);
              return (
                <div className="mt-3 rounded-2xl bg-black/25 p-3">
                  {id === "awards" ? <div className="text-xs font-bold text-emerald-300">📱 Awards always use phone voting</div> : <button onClick={() => { buzz(); run({ type: "pv", on: !state.pv }); }} className={`w-full rounded-xl py-2.5 text-sm font-extrabold ${state.pv ? "bg-emerald-500" : "bg-white/20"}`}>📱 Phone voting: {state.pv ? "ON" : "OFF"}</button>}
                  {(state.pv || id === "awards") && <div className="mt-2 text-xs text-white/85" data-testid="vote-status">{Object.keys(cv).length} / {voters.length} voted{state.beat === 1 && missing.length > 0 && missing.length < voters.length ? ` · waiting on ${missing.map((m) => m.firstName.replace(/[\[\]]/g, "")).join(", ")}` : ""}</div>}
                </div>
              );
            })()}
            <button disabled={last} onClick={() => { buzz(); run({ type: "gnext" }); }} className="mt-3 w-full rounded-2xl bg-gradient-to-br from-hot to-[#d4106f] py-5 text-lg font-extrabold tracking-wide shadow-lg shadow-hot/40 transition active:scale-[.97] disabled:opacity-40">{last ? "Last card done — tap NEXT ▶" : `${meta.labels[state.beat]} ▶`}</button>
            <button onClick={() => { buzz(); run({ type: "gprev" }); }} className="mt-2 w-full rounded-xl bg-white/15 py-2.5 text-sm font-bold">◀ Back a step</button>
            {id === "redflag" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => { buzz(); run({ type: "verdict", v: "red" }); }} className={`rounded-xl py-3 text-sm font-bold ${verdict === "red" ? "bg-red-500" : "bg-white/15"}`}>🚩 Red flag</button>
                <button onClick={() => { buzz(); run({ type: "verdict", v: "ok" }); }} className={`rounded-xl py-3 text-sm font-bold ${verdict === "ok" ? "bg-emerald-500" : "bg-white/15"}`}>✅ Personality</button>
              </div>
            )}
            {(id === "canceled" || id === "exposed") && (
              <>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-[.2em] text-white/70">{id === "canceled" ? "Tap who got canceled" : "Tap who put a finger down"}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {cast.slice(0, CAST_SIZE).map((c, i) => (
                    <button key={c.id} onClick={() => { buzz(); run({ type: "mark", who: i }); }} className={`truncate rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${picks.includes(i) ? "bg-hot" : "bg-white/15"}`}>{picks.includes(i) ? (id === "exposed" ? "👇 " : "🚫 ") : ""}{c.firstName.replace(/[\[\]]/g, "")}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {step.kind === "finale" && (
        <div className="mt-4 rounded-3xl border border-white/30 bg-[#04283e]/60 p-4 backdrop-blur" data-testid="finale-panel">
          <div className="text-[11px] font-semibold uppercase tracking-[.25em] text-gold">🎂 Finale · tap in order</div>
          <div className="mt-3 grid gap-3">
            <Btn onClick={() => run({ type: "finale", stage: 0 })} className={state.finale === 0 ? "bg-amber-400 text-black" : "bg-white/15 ring-1 ring-white/30"}>1 · 🕯 Candles lit (make a wish)</Btn>
            <Btn onClick={() => run({ type: "finale", stage: 1 })} className={state.finale === 1 ? "bg-amber-400 text-black" : "bg-gradient-to-br from-hot to-[#d4106f]"}>2 · 🌬 Blow them out! (Happy Birthday)</Btn>
            <Btn onClick={() => run({ type: "finale", stage: 2 })} className={state.finale === 2 ? "bg-amber-400 text-black" : "bg-gradient-to-br from-[#ffb02e] to-[#ff7a2e]"}>3 · 🏆 Winners recap</Btn>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-3xl border border-red-400/60 bg-red-900/30 p-4 backdrop-blur" data-testid="hot-panel">
        <div className="text-[11px] font-semibold uppercase tracking-[.3em] text-red-200">🔥 Surprise Hot Seat{state.hot.on ? " · ON AIR" : ""}</div>
        {state.hot.on ? (
          <Btn onClick={() => run({ type: "hotEnd" })} className="mt-3 w-full bg-white text-red-700">✖ End Hot Seat</Btn>
        ) : (
          <>
            <Btn onClick={() => { const q = Math.floor(Math.random() * Math.max(data.decks.hotseat.length, 1)); run({ type: "hotStart", who: Math.floor(Math.random() * CAST_SIZE), q }); }} className="mt-3 w-full bg-gradient-to-br from-red-500 to-[#ff2d95]">🎲 Random victim!</Btn>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {cast.slice(0, CAST_SIZE).map((c, i) => (
                <button key={c.id} onClick={() => { buzz(); run({ type: "hotStart", who: i, q: Math.floor(Math.random() * Math.max(data.decks.hotseat.length, 1)) }); }} className="truncate rounded-lg bg-white/15 px-1 py-2 text-xs font-semibold">{c.firstName.replace(/[\[\]]/g, "")}</button>
              ))}
            </div>
          </>
        )}
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
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[.25em] text-white/70">Host &amp; islanders</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={() => { buzz(); run({ type: "goto", step: STEP.host }); }} className={`col-span-2 truncate rounded-xl px-3 py-2 text-left text-sm font-semibold ${step.kind === "host" ? "bg-hot" : "bg-gradient-to-r from-[#ffb02e]/60 to-[#ff7a2e]/60"}`}>🎤 Host · {data.poster.host?.firstName ?? "—"}</button>
          {cast.slice(0, CAST_SIZE - 1).map((c, i) => (
            <button key={c.id} onClick={() => { buzz(); run({ type: "goto", step: STEP.firstCast + i }); }} className={`truncate rounded-xl px-3 py-2 text-left text-sm font-semibold ${state.step === STEP.firstCast + i ? "bg-hot" : "bg-white/15"}`}>
              <span className="mr-1 opacity-70">{i + 1}.</span>{c.firstName}
            </button>
          ))}
          <button onClick={() => { buzz(); run({ type: "bombshell" }); }} className={`truncate rounded-xl px-3 py-2 text-left text-sm font-semibold ${step.kind === "bombshell" ? "bg-hot" : "bg-gradient-to-r from-[#ffb02e]/60 to-[#ff2d95]/60"}`}>★ {cast[CAST_SIZE - 1].firstName}</button>
        </div>
        <div className="mt-4 text-[11px] font-semibold uppercase tracking-[.25em] text-white/70">Rounds</div>
        <div className="mt-2 grid gap-2">
          {ROUNDS.map((r, i) => (
            <button key={r.id} onClick={() => { buzz(); run({ type: "goto", step: introStep(r.id) }); }} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${(step.kind === "roundIntro" || step.kind === "round") && step.id === r.id ? "bg-hot" : "bg-white/15"}`}>{r.icon} {r.n}. {r.title}</button>
          ))}
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
