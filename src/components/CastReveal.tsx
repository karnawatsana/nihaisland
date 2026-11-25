"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Islander } from "@/lib/types";
import { Sky } from "./Sky";
import { Silhouette } from "./Silhouette";

export const isPh = (t: string) => t.trim().startsWith("[");
export const nameSize = (n: string, max: number) => Math.max(110, Math.min(max, (1000 / Math.max(n.length, 5)) * 1.7));

function CountUp({ to, delay }: { to: number; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now() + delay * 1000;
    const tick = (t: number) => { const k = Math.max(0, Math.min(1, (t - t0) / 1300)); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to, delay]);
  return <>{v}</>;
}

export function Stats({ islander, delay = 1.6, gold = false }: { islander: Islander; delay?: number; gold?: boolean }) {
  return (
    <div className="grid grid-cols-2" style={{ gap: "26px 44px", maxWidth: 900 }}>
      {islander.stats.map((s, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.92)", textShadow: "0 2px 10px rgba(0,40,60,.6)" }}>
            <span>{s.label}</span><span style={{ fontSize: 30, fontWeight: 800, color: gold ? "#ffe39a" : "#fff" }}><CountUp to={s.value} delay={delay + i * 0.18} /></span>
          </div>
          <div style={{ marginTop: 8, height: 20, borderRadius: 99, background: "rgba(2,40,60,.45)", border: "1px solid rgba(255,255,255,.3)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ delay: delay + i * 0.18, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%", borderRadius: 99, background: gold ? "linear-gradient(90deg,#ff2d95,#ffd27a,#fff3c4)" : `linear-gradient(90deg,${islander.accent},#ffd27a)`, boxShadow: `0 0 18px ${islander.accent}` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Portrait({ islander, w, h, fallback, gold = false }: { islander: Islander; w: number; h: number; fallback?: string | null; gold?: boolean }) {
  const src = islander.photo ?? fallback ?? null;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ position: "absolute", inset: -10, borderRadius: `${w / 2 + 10}px ${w / 2 + 10}px 34px 34px`, padding: 10, background: gold ? "conic-gradient(from 0deg,#fff3c4,#ffd27a,#ff2d95,#ffd27a,#fff3c4)" : `linear-gradient(160deg,${islander.accent},#ffd27a)`, boxShadow: `0 0 90px 10px ${gold ? "rgba(255,200,100,.7)" : islander.accent + "99"}, 0 30px 60px rgba(0,30,50,.5)`, animation: gold ? "spin 14s linear infinite" : undefined, display: gold ? "none" : "block" }} />
      {gold && <div style={{ position: "absolute", inset: -14, borderRadius: `${w / 2 + 14}px ${w / 2 + 14}px 38px 38px`, overflow: "hidden", boxShadow: "0 0 110px 20px rgba(255,200,100,.65), 0 30px 60px rgba(0,30,50,.5)" }}><div style={{ position: "absolute", inset: "-50%", background: "conic-gradient(from 0deg,#fff3c4,#ffd27a,#ff2d95,#ffd27a,#fff3c4)", animation: "spin 9s linear infinite" }} /></div>}
      <div style={{ position: "absolute", inset: 0, borderRadius: `${w / 2}px ${w / 2}px 28px 28px`, overflow: "hidden", background: `linear-gradient(180deg,${islander.accent}55,#3a0b5288)` }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={islander.firstName} draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }} />
        ) : (
          <Silhouette color={islander.accent} initial={islander.firstName.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase() || "?"} label={isPh(islander.firstName) ? "Photo placeholder" : "No photo yet"} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,.18),transparent 30%,transparent 70%,rgba(0,20,40,.35))" }} />
      </div>
    </div>
  );
}

export function CastReveal({ islander, index, total, introKey }: { islander: Islander; index: number; total: number; introKey: number }) {
  const right = index % 2 === 0;
  const ph = (t: string) => (isPh(t) ? { fontStyle: "italic" as const, opacity: 0.7 } : {});
  return (
    <div className="stage-layer" key={introKey}>
      <Sky dim={0.18} sunX={right ? 560 : 1360} palms={false} tint={`radial-gradient(circle at ${right ? "70%" : "30%"} 40%, ${islander.accent}55, transparent 60%)`} />
      <div style={{ position: "absolute", top: 120, [right ? "left" : "right"]: -40, fontSize: 520, fontWeight: 800, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "3px rgba(255,255,255,.22)", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 0.9 }}>{islander.firstName.replace(/[\[\]]/g, "").slice(0, 7)}</div>
      {/* portrait */}
      <motion.div initial={{ opacity: 0, y: 120, scale: 1.12, filter: "blur(18px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ delay: 0.25, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", top: 108, [right ? "right" : "left"]: 150 }}>
        <Portrait islander={islander} w={640} h={860} />
      </motion.div>
      {/* copy */}
      <div style={{ position: "absolute", top: 92, [right ? "left" : "right"]: 120, width: 1000 }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.9 }} className="flex items-center gap-4"
          style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.4em", textShadow: "0 2px 12px rgba(0,60,90,.6)" }}>
          <span style={{ background: islander.accent, borderRadius: 99, padding: "6px 22px", letterSpacing: "0.25em", fontSize: 22 }}>ISLANDER {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
          <span style={{ opacity: 0.9 }}>NIHA ISLAND</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: right ? -120 : 120, filter: "blur(16px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: 0.7, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: 18, fontSize: nameSize(islander.firstName, 215), fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", textTransform: "uppercase", whiteSpace: "nowrap", color: "#fff", textShadow: `0 8px 0 ${islander.accent}, 0 18px 40px rgba(0,30,50,.5)`, ...ph(islander.firstName) }}>
          {islander.firstName}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.9 }}
          className="font-serif" style={{ marginTop: 22, fontSize: 66, fontStyle: "italic", fontWeight: 700, color: "#ffe39a", textShadow: "0 4px 22px rgba(120,40,0,.55)", ...ph(islander.nickname) }}>
          “{islander.nickname.replace(/^"|"$/g, "")}”
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
          style={{ marginTop: 26, fontSize: 36, lineHeight: 1.32, fontWeight: 500, maxWidth: 930, color: "rgba(255,255,255,.96)", textShadow: "0 2px 14px rgba(0,40,70,.7)", ...ph(islander.bio) }}>
          {islander.bio}
        </motion.p>
        <div style={{ marginTop: 40 }}><Stats islander={islander} /></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6, duration: 1 }} className="glass"
          style={{ marginTop: 40, borderRadius: 28, padding: "24px 36px", maxWidth: 930, display: "flex", gap: 20, alignItems: "flex-start", background: "rgba(3,40,66,.45)" }}>
          <span className="font-serif" style={{ fontSize: 96, lineHeight: 0.7, color: islander.accent, fontWeight: 700 }}>“</span>
          <span style={{ fontSize: 36, fontWeight: 600, fontStyle: "italic", lineHeight: 1.25, textShadow: "0 2px 10px rgba(0,30,50,.5)", ...ph(islander.quote) }}>{islander.quote}</span>
        </motion.div>
      </div>
    </div>
  );
}
