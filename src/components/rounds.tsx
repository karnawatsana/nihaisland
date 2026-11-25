"use client";
import { motion } from "motion/react";
import { ROUNDS, type RoundId } from "@/lib/sequence";
import { Sky, Sparkles } from "./Sky";

/**
 * PHASE 2 HOOK — to build a real game, add an entry to GAME_SCREENS keyed by round id.
 * The sequence, host controller and sync layer stay exactly the same.
 */
export const GAME_SCREENS: Partial<Record<RoundId, (p: { introKey: number }) => React.ReactNode>> = {};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8, duration: 0.8 }} className="glass"
    style={{ display: "inline-block", marginTop: 60, borderRadius: 99, padding: "16px 44px", fontSize: 28, fontWeight: 700, letterSpacing: "0.35em", background: "rgba(3,40,66,.5)" }}>{children}</motion.div>
);

export function RoundScreen({ id, introKey }: { id: RoundId; introKey: number }) {
  const Game = GAME_SCREENS[id]; if (Game) return <>{Game({ introKey })}</>;
  const r = ROUNDS.find((x) => x.id === id)!;
  return (
    <div className="stage-layer" key={introKey}>
      <Sky dim={0.28} palms={false} sunX={960} tint={`radial-gradient(circle at 50% 50%, ${r.hue}66, transparent 65%)`} />
      <div className="stage-layer flex flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }} style={{ fontSize: 38, fontWeight: 700, letterSpacing: "0.6em", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>NIHA ISLAND · ROUND {r.n}</motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.4, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.5, duration: 1, type: "spring", bounce: 0.45 }} style={{ fontSize: 190, marginTop: 20, filter: "drop-shadow(0 12px 30px rgba(0,30,50,.5))" }}>{r.icon}</motion.div>
        <motion.div initial={{ opacity: 0, y: 60, filter: "blur(18px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="title-pink" style={{ marginTop: 10, fontSize: 150, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", maxWidth: 1600 }}>{r.title.toLowerCase()}</motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="font-serif" style={{ marginTop: 34, fontSize: 60, fontStyle: "italic", fontWeight: 700, color: "#ffe39a", textShadow: "0 4px 20px rgba(100,40,0,.6)" }}>{r.tag}</motion.div>
        <Badge>PLACEHOLDER · GAME ARRIVES IN PHASE 2</Badge>
      </div>
    </div>
  );
}

export function HotSeatScreen({ introKey }: { introKey: number }) {
  return (
    <div className="stage-layer" key={introKey} style={{ background: "radial-gradient(circle at 50% 50%, #5a0b1f 0, #12030a 75%)" }}>
      <div className="stage-layer" style={{ background: "radial-gradient(circle, transparent 35%, #ff3b3b 150%)", animation: "siren 1s ease-in-out infinite" }} />
      <div className="stage-layer flex flex-col items-center justify-center text-center" style={{ animation: "glitch 0.8s steps(2) infinite" }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "0.6em", color: "#ffd27a" }}>⚠ SURPRISE INTERRUPTION ⚠</div>
        <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} style={{ fontSize: 330, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em", textShadow: "0 0 60px #ff2d2d, 6px 6px 0 #ff2d95" }}>HOT SEAT</motion.div>
        <Badge>PLACEHOLDER · ARRIVES IN PHASE 2</Badge>
      </div>
    </div>
  );
}

export function FinaleScreen({ introKey }: { introKey: number }) {
  return (
    <div className="stage-layer" key={introKey}>
      <Sky dim={0.05} sunX={960} tint="radial-gradient(circle at 50% 40%, rgba(255,45,149,.45), transparent 65%)" />
      <Sparkles count={60} seed={31} />
      <div className="stage-layer flex flex-col items-center justify-center text-center">
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "0.6em", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>NIHA ISLAND</div>
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1.2 }} className="gold-text" style={{ fontSize: 200, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 20 }}>birthday finale</motion.div>
        <Badge>PLACEHOLDER · ARRIVES IN PHASE 2</Badge>
      </div>
    </div>
  );
}
