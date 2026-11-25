"use client";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Islander } from "@/lib/types";
import { Sky, Sparkles } from "./Sky";
import { Portrait, Stats, isPh, nameSize } from "./CastReveal";
import { rng } from "@/lib/rng";

const ALERT_MS = 5600;

function Confetti() {
  const pieces = useMemo(() => { const R = rng(21); const cols = ["#ff2d95", "#ffd27a", "#19c3dc", "#fff", "#ff7ac0", "#ffe9a8"]; return Array.from({ length: 70 }, (_, i) => ({ x: R() * 1920, d: R() * 5, t: 5 + R() * 4, w: 10 + R() * 14, h: 16 + R() * 18, c: cols[i % cols.length], cx: (R() - 0.5) * 300, cr: 360 + R() * 900 })); }, []);
  return (
    <div className="stage-layer pointer-events-none overflow-hidden">
      {pieces.map((p, i) => <span key={i} style={{ position: "absolute", left: p.x, top: 0, width: p.w, height: p.h, background: p.c, borderRadius: 3, animation: `confetti ${p.t}s linear ${p.d}s infinite`, ["--cx" as string]: `${p.cx}px`, ["--cr" as string]: `${p.cr}deg` }} />)}
    </div>
  );
}

function Tape({ top, rot, rev }: { top: number; rot: number; rev?: boolean }) {
  const text = Array(8).fill("BIRTHDAY BOMBSHELL INCOMING ✦ ").join("");
  return (
    <div style={{ position: "absolute", left: -200, top, width: 2400, height: 78, transform: `rotate(${rot}deg)`, background: "repeating-linear-gradient(45deg,#ff2d95 0 36px,#12040f 36px 72px)", boxShadow: "0 0 50px rgba(255,45,149,.8)", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ whiteSpace: "nowrap", fontSize: 44, fontWeight: 800, letterSpacing: "0.2em", color: "#fff", background: "#12040f", padding: "4px 0", animation: `${rev ? "drift" : "drift"} 22s linear infinite ${rev ? "reverse" : ""}` }}>{text}</div>
    </div>
  );
}

export function Bombshell({ islander, introKey, fallbackPhoto, onReveal }: { islander: Islander; introKey: number; fallbackPhoto?: string | null; onReveal?: () => void }) {
  const [phase, setPhase] = useState<0 | 1>(0);
  useEffect(() => { setPhase(0); const t = setTimeout(() => { setPhase(1); onReveal?.(); }, ALERT_MS); return () => clearTimeout(t); }, [introKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const ph = (t: string) => (isPh(t) ? { fontStyle: "italic" as const, opacity: 0.75 } : {});
  if (phase === 0) {
    return (
      <div className="stage-layer" key={`a${introKey}`} style={{ background: "radial-gradient(circle at 50% 50%, #4a0a3a 0, #14030f 70%)" }}>
        <div className="stage-layer" style={{ opacity: 0.55, mixBlendMode: "screen", animation: "spin 4s linear infinite", background: "conic-gradient(from 0deg at 50% 50%, rgba(255,45,149,.95) 0deg 22deg, transparent 22deg 180deg, rgba(255,45,149,.95) 180deg 202deg, transparent 202deg 360deg)", WebkitMaskImage: "radial-gradient(circle, #000 0, transparent 70%)", maskImage: "radial-gradient(circle, #000 0, transparent 70%)" }} />
        <div className="stage-layer" style={{ background: "radial-gradient(circle at 50% 50%, transparent 40%, #ff2d95 140%)", animation: "siren 0.9s ease-in-out infinite" }} />
        <Tape top={120} rot={-4} /><Tape top={880} rot={3} rev />
        <div className="stage-layer flex flex-col items-center justify-center text-center" style={{ animation: "glitch 0.6s steps(2) infinite" }}>
          <motion.div initial={{ opacity: 0, scale: 2.2 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ fontSize: 46, letterSpacing: "0.6em", fontWeight: 700, color: "#ffd27a" }}>⚠ ALERT ⚠</motion.div>
          {["BIRTHDAY", "BOMBSHELL", "INCOMING"].map((w, i) => (
            <motion.div key={w} initial={{ opacity: 0, scale: 1.6, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ delay: 0.5 + i * 0.7, duration: 0.45, ease: "easeOut" }}
              style={{ fontSize: i === 1 ? 250 : 200, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em", color: i === 2 ? "#ffd27a" : "#fff", textShadow: "0 0 50px rgba(255,45,149,.95), 4px 4px 0 #ff2d95, -4px -4px 0 #19c3dc" }}>{w}</motion.div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="stage-layer" key={`b${introKey}`}>
      <Sky dim={0.1} sunX={1100} palms={false} tint="radial-gradient(circle at 30% 45%, rgba(255,45,149,.55), transparent 60%)" />
      <div className="stage-layer" style={{ opacity: 0.55, mixBlendMode: "screen", animation: "spin 40s linear infinite", background: "repeating-conic-gradient(from 0deg at 28% 48%, rgba(255,236,170,.7) 0deg 4deg, transparent 4deg 18deg)", WebkitMaskImage: "radial-gradient(circle at 28% 48%, #000 0, transparent 60%)", maskImage: "radial-gradient(circle at 28% 48%, #000 0, transparent 60%)" }} />
      <Confetti /><Sparkles count={50} seed={77} />
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.1 }} className="stage-layer pointer-events-none" style={{ background: "#fff" }} />
      <motion.div initial={{ opacity: 0, scale: 0.7, y: 120, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.3, duration: 1.6, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", left: 130, top: 78 }}>
        <Portrait islander={islander} w={700} h={930} fallback={fallbackPhoto} gold />
      </motion.div>
      <div style={{ position: "absolute", left: 960, top: 78, width: 900 }}>
        <motion.div initial={{ opacity: 0, letterSpacing: "1em" }} animate={{ opacity: 1, letterSpacing: "0.42em" }} transition={{ delay: 0.8, duration: 1.4 }} style={{ fontSize: 30, fontWeight: 800, color: "#fff", textShadow: "0 2px 14px rgba(120,0,70,.7)" }}>★ THE BIRTHDAY BOMBSHELL ★</motion.div>
        <motion.div initial={{ opacity: 0, y: 70, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="gold-text"
          style={{ marginTop: 6, fontSize: nameSize(islander.firstName, 250), fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", textTransform: "uppercase", whiteSpace: "nowrap", filter: "drop-shadow(0 8px 0 rgba(160,0,90,.6)) drop-shadow(0 0 40px rgba(255,200,100,.6))", ...ph(islander.firstName) }}>{islander.firstName}</motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.9 }} className="font-serif" style={{ marginTop: 10, fontSize: 70, fontStyle: "italic", fontWeight: 700, color: "#fff", textShadow: "0 4px 24px rgba(160,0,90,.7)", ...ph(islander.nickname) }}>“{islander.nickname.replace(/^"|"$/g, "")}”</motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9, duration: 1 }} style={{ marginTop: 24, fontSize: 36, lineHeight: 1.32, fontWeight: 500, textShadow: "0 2px 14px rgba(60,0,50,.8)", ...ph(islander.bio) }}>{islander.bio}</motion.p>
        <div style={{ marginTop: 36 }}><Stats islander={islander} delay={2.4} gold /></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.4, duration: 1 }} className="glass" style={{ marginTop: 34, borderRadius: 28, padding: "22px 34px", display: "flex", gap: 18, background: "rgba(90,0,60,.45)", borderColor: "rgba(255,226,150,.6)" }}>
          <span className="font-serif gold-text" style={{ fontSize: 96, lineHeight: 0.7, fontWeight: 700 }}>“</span>
          <span style={{ fontSize: 36, fontWeight: 600, fontStyle: "italic", lineHeight: 1.25, ...ph(islander.quote) }}>{islander.quote}</span>
        </motion.div>
      </div>
    </div>
  );
}
