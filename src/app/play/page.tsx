"use client";
import { useEffect, useState } from "react";
import { Presentation } from "@/components/Presentation";
import { Sky } from "@/components/Sky";
import { Stage } from "@/components/Stage";

const KEY = "niha:tvRoom";

export default function Play() {
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [input, setInput] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("room")?.toUpperCase();
    let saved: string | null = null; try { saved = localStorage.getItem(KEY); } catch {}
    const c = q || saved || null;
    if (q) { try { localStorage.setItem(KEY, q); } catch {} }
    setCode(c);
  }, []);
  if (code === undefined) return <div className="fixed inset-0 bg-[#02121c]" />;
  if (code) return <Presentation code={code} />;
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-90"><Stage><Sky palms /></Stage></div>
      <form className="relative z-10 flex h-full flex-col items-center justify-center gap-6 p-6 text-center"
        onSubmit={(e) => { e.preventDefault(); const c = input.trim().toUpperCase(); if (c) { try { localStorage.setItem(KEY, c); } catch {} setCode(c); } }}>
        <h1 className="title-pink text-7xl font-extrabold tracking-tight sm:text-9xl">niha island</h1>
        <p className="text-lg font-semibold tracking-[.3em] text-white drop-shadow">TV SCREEN · ENTER ROOM CODE</p>
        <input autoFocus value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} maxLength={8} placeholder="ABCD" aria-label="Room code"
          className="w-72 rounded-2xl border-2 border-white/70 bg-white/20 px-4 py-4 text-center text-5xl font-extrabold uppercase tracking-[.3em] text-white placeholder-white/50 outline-none backdrop-blur" />
        <button className="rounded-full bg-hot px-10 py-4 text-xl font-bold tracking-[.25em] shadow-xl">OPEN TV</button>
        <p className="text-sm text-white/90">Don&apos;t have a room? <a className="underline" href="/setup">Create one in Setup</a> or <a className="underline" href="/demo">launch the demo</a>.</p>
      </form>
    </div>
  );
}
