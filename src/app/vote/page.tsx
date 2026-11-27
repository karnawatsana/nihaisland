"use client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/games";
import { Shell } from "@/components/Shell";
import { GAME_META } from "@/lib/decks";
import { STEPS } from "@/lib/sequence";
import { useRoom } from "@/lib/useRoom";
import type { Islander } from "@/lib/types";

const buzz = () => { try { navigator.vibrate?.(25); } catch {} };

export default function Vote() {
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [input, setInput] = useState("");
  const [me, setMe] = useState<number | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("room")?.toUpperCase() ?? "";
    let saved = ""; try { saved = localStorage.getItem("niha:voteRoom") ?? ""; } catch {}
    const c = q || saved || null; setCode(c);
    if (c) { try { localStorage.setItem("niha:voteRoom", c); const m = localStorage.getItem(`niha:me:${c}`); if (m !== null) setMe(+m); } catch {} }
  }, []);
  if (code === undefined) return <Shell><div className="p-10 text-center">…</div></Shell>;
  if (!code) return (
    <Shell><form className="mx-auto max-w-sm px-6 pt-16 text-center" onSubmit={(e) => { e.preventDefault(); const c = input.trim().toUpperCase(); if (c) { try { localStorage.setItem("niha:voteRoom", c); } catch {} setCode(c); } }}>
      <div className="title-pink text-6xl font-extrabold">niha island</div><p className="mt-2 text-sm font-bold uppercase tracking-[.3em]">Vote · enter room code</p>
      <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} maxLength={8} aria-label="Room code" placeholder="ABCD" className="mt-6 w-full rounded-2xl border-2 border-white/60 bg-white/20 px-4 py-4 text-center text-4xl font-extrabold tracking-[.3em] outline-none placeholder:text-white/40" />
      <button className="mt-4 w-full rounded-2xl bg-hot py-4 text-lg font-bold tracking-[.2em]">JOIN</button></form></Shell>
  );
  return <Shell><Voter code={code} me={me} setMe={(i) => { setMe(i); try { if (i === null) localStorage.removeItem(`niha:me:${code}`); else localStorage.setItem(`niha:me:${code}`, String(i)); } catch {} }} /></Shell>;
}

function Voter({ code, me, setMe }: { code: string; me: number | null; setMe: (i: number | null) => void }) {
  const { data, status, send } = useRoom(code);
  const [err, setErr] = useState("");
  if (!data) return <div className="p-10 text-center">{status === "missing" ? "Room not found — check the code." : "Joining the villa…"}</div>;
  const people: Islander[] = [...data.cast.slice(0, 8), ...(data.poster.host ? [data.poster.host] : [])];
  const name = (c: Islander) => c.firstName.replace(/[\[\]]/g, "");

  if (me === null || !people[me]) {
    return (
      <div className="mx-auto max-w-md px-4 pb-10 pt-6">
        <div className="text-center"><div className="title-pink text-4xl font-extrabold">niha island</div><h1 className="mt-2 text-2xl font-extrabold">Who are you?</h1><p className="text-sm text-white/85">Tap your name. You&apos;ll vote as this person.</p></div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {people.map((c, i) => (
            <button key={c.id} onClick={() => { buzz(); setMe(i); }} className="flex flex-col items-center rounded-2xl bg-white/15 p-2 ring-1 ring-white/30 active:scale-95">
              <Avatar c={c} size={78} /><span className="mt-2 truncate text-sm font-bold">{name(c)}{i === 8 ? " (host)" : ""}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { state } = data; const step = STEPS[state.step];
  const mine = people[me];
  const header = (
    <div className="flex items-center justify-between rounded-2xl bg-[#04283e]/60 px-4 py-3 ring-1 ring-white/25">
      <div className="flex items-center gap-3"><Avatar c={mine} size={44} /><div><div className="text-[11px] font-semibold uppercase tracking-[.2em] text-white/70">Voting as</div><div className="text-lg font-extrabold leading-none">{name(mine)}</div></div></div>
      <button className="text-xs underline" onClick={() => setMe(null)}>Not you?</button>
    </div>
  );

  let body: React.ReactNode;
  if (step.kind !== "round" || !state.pv) {
    body = <Wait emoji="🌴" title={step.kind === "round" ? "Phone voting is off for this round" : "Waiting for the next round…"} sub="Keep this page open — it updates by itself." />;
  } else {
    const id = step.id; const meta = GAME_META[id];
    const list: string[] = id === "receipts" ? data.decks.receipts.map((r) => r.q) : data.decks[id];
    const idx = Math.min(state.card, Math.max(list.length - 1, 0));
    const prompt = list[idx] ?? ""; const key = `${id}:${idx}`;
    const myVote = state.votes[key]?.[String(me)];
    const cast = async (choice: string | number) => {
      buzz(); setErr("");
      const e = await send({ type: "vote", voter: me, choice });
      if (e) setErr(e);
    };
    const prefix = id === "canceled" ? "Most likely to get canceled for…" : id === "exposed" ? "Never have I ever…" : id === "redflag" ? "Red flag — or just a personality?" : "Who…";
    const card = (
      <div className="rounded-3xl bg-[#04283e]/60 p-5 ring-1 ring-white/25 backdrop-blur">
        <div className="text-[11px] font-semibold uppercase tracking-[.25em] text-gold">{meta.icon} {meta.title}</div>
        <div className="mt-1 text-sm font-semibold text-white/80">{prefix}</div>
        <div className="mt-1 text-xl font-extrabold leading-snug">{prompt}</div>
      </div>
    );
    if (state.beat === 0) body = <>{card}<Wait emoji="⏳" title="Get ready…" sub="Voting opens when the host starts the round." /></>;
    else if (state.beat >= 2) body = <>{card}<Wait emoji="📺" title="Eyes on the TV!" sub={myVote === undefined ? "You didn't vote on this one." : `You voted: ${typeof myVote === "number" ? name(people[myVote]) : myVote === "red" ? "🚩 Red flag" : myVote === "ok" ? "✅ Personality" : myVote === "yes" ? "👇 I have" : "✋ Never"}`} /></>;
    else body = (
      <>
        {card}
        <div className="mt-1 text-center text-sm font-bold uppercase tracking-[.25em] text-gold">{myVote === undefined ? "Cast your vote!" : "Voted ✓ — you can change it"}</div>
        {(id === "canceled" || id === "receipts") && (
          <div className="grid grid-cols-2 gap-3">
            {people.slice(0, 8).map((c, i) => i === me ? null : (
              <button key={c.id} onClick={() => cast(i)} className={`flex items-center gap-3 rounded-2xl p-3 text-left font-bold active:scale-95 ${myVote === i ? "bg-hot ring-2 ring-white" : "bg-white/15 ring-1 ring-white/30"}`}><Avatar c={c} size={44} /><span className="truncate">{name(c)}</span></button>
            ))}
          </div>
        )}
        {id === "redflag" && (
          <div className="grid gap-3">
            <button onClick={() => cast("red")} className={`rounded-3xl py-8 text-3xl font-extrabold active:scale-95 ${myVote === "red" ? "bg-red-500 ring-4 ring-white" : "bg-red-500/60"}`}>🚩 Red flag</button>
            <button onClick={() => cast("ok")} className={`rounded-3xl py-8 text-3xl font-extrabold active:scale-95 ${myVote === "ok" ? "bg-emerald-500 ring-4 ring-white" : "bg-emerald-500/60"}`}>✅ Just a personality</button>
          </div>
        )}
        {id === "exposed" && (
          <div className="grid gap-3">
            <button onClick={() => cast("yes")} className={`rounded-3xl py-8 text-3xl font-extrabold active:scale-95 ${myVote === "yes" ? "bg-hot ring-4 ring-white" : "bg-hot/60"}`}>👇 I have…</button>
            <button onClick={() => cast("no")} className={`rounded-3xl py-8 text-3xl font-extrabold active:scale-95 ${myVote === "no" ? "bg-sky-500 ring-4 ring-white" : "bg-sky-500/60"}`}>✋ Never</button>
          </div>
        )}
      </>
    );
  }
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-10 pt-4" data-testid="vote-page">
      {header}{body}
      {err && <div role="alert" className="rounded-xl bg-red-500/90 px-3 py-2 text-sm font-semibold">{err}</div>}
      {status !== "live" && <div className="text-center text-xs font-bold text-amber-300">Reconnecting…</div>}
    </div>
  );
}

function Wait({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return <div className="rounded-3xl bg-[#04283e]/50 px-6 py-10 text-center ring-1 ring-white/20"><div className="text-6xl">{emoji}</div><div className="mt-3 text-xl font-extrabold">{title}</div><div className="mt-1 text-sm text-white/80">{sub}</div></div>;
}
