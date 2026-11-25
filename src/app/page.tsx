import { Shell } from "@/components/Shell";
import Link from "next/link";

const cards = [
  { href: "/play", t: "TV · /play", d: "The public 16:9 presentation. Open on the big screen.", c: "from-[#19c3dc] to-[#0a7fa8]" },
  { href: "/host", t: "Host remote · /host", d: "Phone controller (PIN protected).", c: "from-[#ff2d95] to-[#d4106f]" },
  { href: "/setup", t: "Setup · /setup", d: "Create your room, edit the cast, upload photos.", c: "from-[#ffb02e] to-[#ff7a2e]" },
  { href: "/demo", t: "Demo · /demo", d: "Launch a fictional sandbox to test everything.", c: "from-[#9b5cff] to-[#5b2bd6]" },
];
export default function Home() {
  return (
    <Shell>
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-xs font-semibold uppercase tracking-[.5em]">NYC Original</div>
        <h1 className="title-pink text-8xl font-extrabold leading-[.85] sm:text-9xl">niha<br />island</h1>
        <p className="mt-5 text-sm font-bold uppercase tracking-[.35em] drop-shadow">Experience the villa at ICON</p>
        <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className={`rounded-3xl bg-gradient-to-br ${c.c} p-5 text-left shadow-xl ring-1 ring-white/40 transition hover:scale-[1.02]`}>
              <div className="text-lg font-extrabold">{c.t}</div><div className="mt-1 text-sm text-white/90">{c.d}</div>
            </Link>
          ))}
        </div>
      </main>
    </Shell>
  );
}
