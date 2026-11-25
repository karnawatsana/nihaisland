"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PosterConfig } from "@/lib/types";
import { Sky } from "./Sky";
import { Silhouette } from "./Silhouette";

const Letters = ({ text, delay, className, size, still }: { text: string; delay: number; className?: string; size: number; still?: boolean }) => (
  <div className={className} style={{ fontSize: size, lineHeight: 0.8, fontWeight: 800, letterSpacing: "-0.045em", display: "flex" }}>
    {text.split("").map((ch, i) => (
      <motion.span key={i} initial={still ? false : { opacity: 0, y: 90, filter: "blur(18px)", scale: 0.9 }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ delay: delay + i * 0.11, duration: 1.15, ease: [0.16, 1, 0.3, 1] }} style={{ display: "inline-block" }}>{ch}</motion.span>
    ))}
  </div>
);

export function Poster({ config, introKey = 0, interactive = false, onEnter, demo = false, still = false }: { config: PosterConfig; introKey?: number; interactive?: boolean; onEnter?: () => void; demo?: boolean; still?: boolean }) {
  const [showBtn, setShowBtn] = useState(false);
  useEffect(() => { setShowBtn(false); const t = setTimeout(() => setShowBtn(true), 6200); return () => clearTimeout(t); }, [introKey]);
  const H = 1030 * config.scale;
  return (
    <div className="stage-layer" key={introKey}>
      <Sky introKey={introKey} />
      {/* subject */}
      <motion.div initial={still ? false : { opacity: 0, x: -140, filter: "blur(22px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: 2.0, duration: 2.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", left: 40 + config.x, bottom: -14 - config.y, height: H, width: H * 0.78 }}>
        <div style={{ position: "absolute", left: "-20%", top: "6%", width: "140%", height: "70%", background: "radial-gradient(ellipse, rgba(255,214,120,.55), rgba(255,45,149,.12) 55%, transparent 72%)", filter: "blur(10px)" }} />
        {config.portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.portrait} alt="Niharika" draggable={false} style={{
            position: "absolute", inset: 0, height: "100%", width: "100%", objectFit: "contain", objectPosition: "50% 100%", transform: config.flip ? "scaleX(-1)" : undefined,
            filter: "drop-shadow(0 0 3px rgba(255,255,255,.55)) drop-shadow(-14px 0 30px rgba(255,200,110,.45)) drop-shadow(12px 6px 34px rgba(255,45,149,.3))",
            ...(config.cutout ? {} : { WebkitMaskImage: "radial-gradient(ellipse 62% 66% at 50% 46%, #000 62%, transparent 100%)", maskImage: "radial-gradient(ellipse 62% 66% at 50% 46%, #000 62%, transparent 100%)" }),
          }} />
        ) : (
          <Silhouette color="#ff2d95" initial="N" label={demo ? "Demo · portrait placeholder" : "Upload Niharika's portrait in /setup → Poster"} />
        )}
      </motion.div>
      {/* warm light-wrap & foreground haze */}
      <div className="stage-layer pointer-events-none" style={{ background: "linear-gradient(180deg,transparent 62%,rgba(255,186,90,.22) 82%,rgba(10,120,160,.0) 100%)" }} />
      {/* title block */}
      <div style={{ position: "absolute", left: 1010, top: 70, width: "max-content" }}>
        <motion.div initial={still ? false : { opacity: 0, y: -16, letterSpacing: "0.9em" }} animate={{ opacity: 1, y: 0, letterSpacing: "0.52em" }} transition={{ delay: 1.1, duration: 1.6, ease: "easeOut" }}
          className="flex items-center gap-5 pl-3" style={{ fontSize: 30, fontWeight: 700, color: "#fff", textShadow: "0 2px 14px rgba(0,70,100,.55)" }}>
          <span>NYC ORIGINAL</span><span style={{ height: 2, width: 130, background: "linear-gradient(90deg,rgba(255,255,255,.9),transparent)" }} />
        </motion.div>
        <div style={{ marginTop: 26, marginLeft: -8 }}>
          <Letters text="niha" delay={1.5} size={330} still={still} className="title-pink" />
          <div style={{ marginTop: 28, paddingRight: 24 }}><Letters text="island" delay={2.1} size={330} still={still} className="title-pink" /></div>
        </div>
        <motion.div initial={still ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.4, duration: 1.4, ease: "easeOut" }}
          style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 33, fontWeight: 700, letterSpacing: "0.34em", color: "#fff", textShadow: "0 2px 18px rgba(0,60,90,.75), 0 0 2px rgba(0,60,90,.6)" }}>EXPERIENCE THE VILLA AT ICON</span>
        </motion.div>
      </div>
      {/* enter */}
      {interactive && showBtn && (
        <motion.button onClick={onEnter} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ position: "absolute", right: 96, bottom: 62, padding: "20px 54px", borderRadius: 999, fontSize: 25, fontWeight: 700, letterSpacing: "0.38em", color: "#fff", animation: "pulseGlow 3.2s ease-in-out infinite", border: "2px solid rgba(255,255,255,.75)", background: "linear-gradient(180deg,rgba(255,45,149,.55),rgba(255,45,149,.28))", backdropFilter: "blur(10px)", textShadow: "0 2px 10px rgba(80,0,50,.6)", cursor: "pointer" }}>
          ENTER THE VILLA
        </motion.button>
      )}
      {/* black-to-reveal opener + grain */}
      {!still && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2.2, ease: "easeInOut" }} className="stage-layer pointer-events-none" style={{ background: "#02121c" }} />}
      <div className="stage-layer pointer-events-none" style={{ opacity: 0.09, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}
