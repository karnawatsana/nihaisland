"use client";
import { useState } from "react";
import { login } from "@/lib/useRoom";

export function HostLogin({ initialCode = "", onDone, title = "Host login" }: { initialCode?: string; onDone: (code: string) => void; title?: string }) {
  const [code, setCode] = useState(initialCode);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form className="mx-auto mt-10 w-full max-w-sm rounded-3xl border border-white/30 bg-[#04283e]/60 p-6 backdrop-blur" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr("");
      const r = await login(code, pin); setBusy(false);
      if (r.error) setErr(r.error); else onDone(code.trim().toUpperCase());
    }}>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-[.25em] text-white/80">Room code</label>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} autoCapitalize="characters" autoComplete="off" aria-label="Room code" placeholder="ABCD"
        className="mt-1 w-full rounded-xl border border-white/40 bg-white/15 px-4 py-3 text-center text-3xl font-extrabold uppercase tracking-[.3em] outline-none placeholder:text-white/40" />
      <label className="mt-4 block text-xs font-semibold uppercase tracking-[.25em] text-white/80">Host PIN</label>
      <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" type="password" maxLength={8} autoComplete="off" aria-label="Host PIN" placeholder="••••"
        className="mt-1 w-full rounded-xl border border-white/40 bg-white/15 px-4 py-3 text-center text-3xl font-extrabold tracking-[.4em] outline-none placeholder:text-white/40" />
      {err && <div role="alert" className="mt-3 rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold">{err}</div>}
      <button disabled={busy || code.length < 3 || pin.length < 4} className="mt-5 w-full rounded-2xl bg-gradient-to-br from-hot to-[#d4106f] py-4 text-lg font-bold tracking-[.2em] disabled:opacity-50">{busy ? "…" : "ENTER"}</button>
    </form>
  );
}
