"use client";
import { motion } from "motion/react";
import { useMemo } from "react";
import { rng } from "@/lib/rng";

const HORIZON = 790;

function cloudTile(h: number, seed: number, rgb: [number, number, number], fx: number, fy: number, gain: number, bias: number) {
  const [r, g, b] = rgb.map((v) => v / 255);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='${h}'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${fx} ${fy}' numOctaves='5' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${gain} ${bias}'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23")}")`;
}

const CLOUDS = [
  { top: 0, h: 420, seed: 3, rgb: [255, 255, 255] as [number, number, number], fx: 0.0042, fy: 0.014, gain: 1.9, bias: -0.78, dur: 260, op: 0.55 },
  { top: 90, h: 520, seed: 11, rgb: [255, 255, 255] as [number, number, number], fx: 0.0035, fy: 0.0085, gain: 2.6, bias: -1.12, dur: 190, op: 0.95 },
  { top: 330, h: 470, seed: 27, rgb: [255, 206, 160] as [number, number, number], fx: 0.0038, fy: 0.011, gain: 2.4, bias: -1.0, dur: 140, op: 0.85 },
];

function Frond({ len = 900, seed = 1, color = "#0c3f33", hi = "#1f8a63" }: { len?: number; seed?: number; color?: string; hi?: string }) {
  const d = useMemo(() => {
    const R = rng(seed); const pts: string[] = []; const droop = 0.42 + R() * 0.1;
    const P = (t: number) => ({ x: len * t, y: droop * len * t * t });
    for (let i = 1; i <= 52; i++) {
      const t = i / 53, p = P(t), q = P(t + 0.01);
      const th = Math.atan2(q.y - p.y, q.x - p.x);
      const ll = (len * 0.2) * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * (1 - t) * 0.95 + 0.05)), 0.8) * (0.55 + 0.45 * (1 - t)) + 14;
      for (const side of [-1, 1]) {
        const a = th + side * (1.05 - 0.25 * t);
        const tipx = p.x + Math.cos(a) * ll, tipy = p.y + Math.sin(a) * ll + ll * 0.45;
        const mx = p.x + Math.cos(a) * ll * 0.5, my = p.y + Math.sin(a) * ll * 0.5 + ll * 0.08;
        const w = 9 + (1 - t) * 8;
        pts.push(`M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${(mx - 0).toFixed(1)} ${(my - w).toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)} Q${(mx + 0).toFixed(1)} ${(my + w).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}Z`);
      }
    }
    return pts.join("");
  }, [len, seed]);
  const rach = `M0 0 Q${len * 0.55} ${len * 0.02} ${len} ${len * 0.42}`;
  return (
    <svg viewBox={`-20 -${len * 0.3} ${len + 160} ${len * 0.95}`} width={len + 160} height={len * 0.95} style={{ overflow: "visible" }}>
      <defs><linearGradient id={`fg${seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hi} /><stop offset="1" stopColor={color} /></linearGradient></defs>
      <path d={d} fill={`url(#fg${seed})`} />
      <path d={rach} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkles({ count = 34, seed = 5, area = [0, 0, 1920, 1080] as number[] }) {
  const items = useMemo(() => {
    const R = rng(seed);
    return Array.from({ length: count }, () => ({ x: area[0] + R() * area[2], y: area[1] + R() * area[3], s: 3 + R() * 7, d: R() * 6, t: 3 + R() * 5, dx: (R() - 0.5) * 80, star: R() > 0.55 }));
  }, [count, seed, area]);
  return (
    <div className="stage-layer pointer-events-none">
      {items.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.x, top: p.y, width: p.s, height: p.s, borderRadius: p.star ? 2 : 99, background: p.star ? "#fff7d6" : "radial-gradient(#fff,rgba(255,255,255,0))", transform: p.star ? "rotate(45deg)" : undefined, boxShadow: "0 0 12px 3px rgba(255,230,160,.8)", animation: `rise ${p.t + 4}s ease-out ${p.d}s infinite`, ["--dx" as string]: `${p.dx}px` }} />
      ))}
    </div>
  );
}

/** The tropical-sunset backdrop: turquoise sky, drifting clouds, golden sun, glittering ocean. */
export function Sky({ introKey = 0, dim = 0, sunX = 1010, palms = true, tint }: { introKey?: number; dim?: number; sunX?: number; palms?: boolean; tint?: string }) {
  const glitter = useMemo(() => {
    const R = rng(9);
    return Array.from({ length: 46 }, (_, i) => { const y = 8 + R() * 270; const spread = 40 + y * 0.9; return { x: sunX + (R() - 0.5) * spread * 2, y: HORIZON + y, w: 14 + R() * 60 * (0.4 + y / 270), d: R() * 4, t: 1.4 + R() * 2.6, i }; });
  }, [sunX]);
  return (
    <div className="stage-layer" style={{ background: `linear-gradient(180deg,#0aa7cf 0%,#1fbfdc 20%,#58d4e2 38%,#a6e6e6 52%,#ffe7b4 66%,#ffd37a ${HORIZON / 10.8 - 3}%,#ffb347 ${HORIZON / 10.8}%)` }}>
      {/* sun */}
      <motion.div key={`sun${introKey}`} className="stage-layer" initial={{ y: 170, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 5.5, ease: [0.16, 1, 0.3, 1] }}>
        <div style={{ position: "absolute", left: sunX - 900, top: HORIZON - 900, width: 1800, height: 1800, background: "radial-gradient(circle at 50% 50%, rgba(255,246,200,.95) 0, rgba(255,222,130,.75) 6%, rgba(255,190,90,.42) 16%, rgba(255,160,90,.18) 32%, rgba(255,150,120,0) 55%)" }} />
        <div style={{ position: "absolute", left: sunX - 720, top: HORIZON - 720, width: 1440, height: 1440, opacity: 0.5, mixBlendMode: "screen", animation: "spin 240s linear infinite", background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,240,190,.55) 0deg 3deg, rgba(255,240,190,0) 3deg 14deg)", WebkitMaskImage: "radial-gradient(circle, #000 0, transparent 62%)", maskImage: "radial-gradient(circle, #000 0, transparent 62%)" }} />
        <div style={{ position: "absolute", left: sunX - 70, top: HORIZON - 52, width: 140, height: 140, borderRadius: 99, background: "radial-gradient(circle,#fffbe8 0,#fff1b5 55%,#ffd36a 100%)", boxShadow: "0 0 90px 40px rgba(255,236,160,.75)" }} />
      </motion.div>
      {/* clouds */}
      {CLOUDS.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: c.top, width: 1920, height: c.h, overflow: "hidden", opacity: c.op, WebkitMaskImage: "linear-gradient(180deg,transparent 0,#000 22%,#000 70%,transparent 100%)", maskImage: "linear-gradient(180deg,transparent 0,#000 22%,#000 70%,transparent 100%)" }}>
          <div className="drift" style={{ width: 3840, height: c.h, backgroundImage: cloudTile(c.h, c.seed, c.rgb, c.fx, c.fy, c.gain, c.bias), backgroundSize: `1920px ${c.h}px`, backgroundRepeat: "repeat-x", ["--dur" as string]: `${c.dur}s` }} />
        </div>
      ))}
      {/* sea */}
      <div style={{ position: "absolute", left: 0, top: HORIZON, width: 1920, height: 1080 - HORIZON, background: "linear-gradient(180deg,#ffd9a0 0%,#8fe3d4 9%,#2fcbd0 30%,#10a7c4 62%,#0a7fa8 100%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: sunX - 260, top: 0, width: 520, height: "100%", background: "radial-gradient(ellipse at 50% 0%, rgba(255,240,170,.95) 0, rgba(255,214,120,.55) 30%, rgba(255,200,120,0) 72%)" }} />
        {[0, 1, 2].map((k) => (
          <svg key={k} width="2880" height="120" viewBox="0 0 2880 120" style={{ position: "absolute", left: 0, top: 36 + k * 78, opacity: 0.22 + k * 0.14, animation: `waveX ${26 - k * 6}s linear infinite${k % 2 ? " reverse" : ""}` }}>
            <path d={`M0 60 ${Array.from({ length: 12 }, (_, j) => `Q${j * 240 + 120} ${k % 2 ? 30 : 90} ${(j + 1) * 240} 60`).join(" ")} V120 H0Z`} fill="#fff" fillOpacity=".5" />
          </svg>
        ))}
      </div>
      {glitter.map((g) => (
        <span key={g.i} style={{ position: "absolute", left: g.x, top: g.y, width: g.w, height: 3, borderRadius: 3, background: "linear-gradient(90deg,transparent,#fff8d8,transparent)", animation: `twinkle ${g.t}s ease-in-out ${g.d}s infinite` }} />
      ))}
      {/* palms framing the top-left & right edge */}
      {palms && (
        <>
          <div style={{ position: "absolute", left: -120, top: -170, transformOrigin: "0 0", animation: "sway 11s ease-in-out infinite" }}><Frond len={1000} seed={4} /></div>
          <div style={{ position: "absolute", left: -180, top: 20, transformOrigin: "0 0", transform: "rotate(38deg)", opacity: 0.95 }}><div style={{ animation: "swayB 13s ease-in-out infinite", transformOrigin: "0 0" }}><Frond len={760} seed={8} color="#0a3329" hi="#16745a" /></div></div>
        </>
      )}
      <Sparkles />
      {tint && <div className="stage-layer" style={{ background: tint, mixBlendMode: "soft-light" }} />}
      {dim > 0 && <div className="stage-layer" style={{ background: `rgba(2,22,36,${dim})` }} />}
      <div className="stage-layer pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(2,30,48,.45) 100%)" }} />
    </div>
  );
}
