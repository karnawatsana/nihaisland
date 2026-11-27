"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { RoomData } from "@/lib/useRoom";
import type { GameKey, Islander } from "@/lib/types";
import { GAME_INTRO, GAME_META } from "@/lib/decks";
import { CAST_SIZE, ROUNDS } from "@/lib/sequence";
import { rng } from "@/lib/rng";
import { Sky, Sparkles } from "./Sky";
import { Silhouette } from "./Silhouette";
import { Confetti } from "./Bombshell";
import { Portrait } from "./CastReveal";
import { authorsOf, receiptStats, type Sub } from "@/lib/receipts";

const ZIG = "polygon(0 0,100% 0,100% calc(100% - 22px),96% 100%,92% calc(100% - 22px),88% 100%,84% calc(100% - 22px),80% 100%,76% calc(100% - 22px),72% 100%,68% calc(100% - 22px),64% 100%,60% calc(100% - 22px),56% 100%,52% calc(100% - 22px),48% 100%,44% calc(100% - 22px),40% 100%,36% calc(100% - 22px),32% 100%,28% calc(100% - 22px),24% 100%,20% calc(100% - 22px),16% 100%,12% calc(100% - 22px),8% 100%,4% calc(100% - 22px),0 100%)";
export const peopleOf = (data: RoomData): Islander[] => [...data.cast.slice(0, CAST_SIZE), ...(data.poster.host ? [data.poster.host] : [])];
const nm = (c: Islander) => c.firstName.replace(/[\[\]]/g, "");

export function Avatar({ c, size, ring = false, badge, count, tag }: { c: Islander; size: number; ring?: boolean; badge?: string; count?: number; tag?: string }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `${ring ? 7 : 4}px solid ${ring ? "#ffe39a" : "rgba(255,255,255,.7)"}`, boxShadow: ring ? `0 0 50px 8px ${c.accent}` : "0 8px 20px rgba(0,30,50,.4)", background: `linear-gradient(180deg,${c.accent}77,#3a0b5299)`, transition: "all .4s" }}>
        {c.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.photo} alt={c.firstName} draggable={false} style={{ width: "100%", height: "100%", objectFit: c.photoCutout ? "contain" : "cover", objectPosition: c.photoCutout ? "50% 100%" : "50% 18%" }} />
        ) : <Silhouette color={c.accent} />}
      </div>
      {badge && <div style={{ position: "absolute", right: -8, top: -10, fontSize: size * 0.4, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.4))" }}>{badge}</div>}
      {tag ? <div style={{ position: "absolute", left: "50%", bottom: -14, transform: "translateX(-50%)", background: "#ffe39a", color: "#06344d", fontWeight: 800, fontSize: size * 0.22, borderRadius: 99, padding: "0 12px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,.3)" }}>{tag}</div> : !!count && <div style={{ position: "absolute", left: "50%", bottom: -14, transform: "translateX(-50%)", background: "#fff", color: "#06344d", fontWeight: 800, fontSize: size * 0.24, borderRadius: 99, padding: "0 14px", boxShadow: "0 4px 12px rgba(0,0,0,.3)" }}>×{count}</div>}
    </div>
  );
}

function Stamp({ text, color, delay = 0.2, size = 92, rot = -8 }: { text: string; color: string; delay?: number; size?: number; rot?: number }) {
  return (
    <motion.div initial={{ scale: 3.2, opacity: 0, rotate: -22 }} animate={{ scale: 1, opacity: 1, rotate: rot }} transition={{ delay, type: "spring", stiffness: 260, damping: 16 }}
      style={{ display: "inline-block", border: `12px solid ${color}`, color, borderRadius: 24, padding: "6px 40px", fontSize: size, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(255,255,255,.88)", textShadow: "none", boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>{text}</motion.div>
  );
}

function Countdown({ word, runKey }: { word: string; runKey: string }) {
  const [n, setN] = useState(3);
  useEffect(() => { setN(3); const t = [setTimeout(() => setN(2), 1000), setTimeout(() => setN(1), 2000), setTimeout(() => setN(0), 3000)]; return () => t.forEach(clearTimeout); }, [runKey]);
  return (
    <div className="stage-layer flex items-center justify-center" style={{ background: "rgba(2,28,44,.55)", backdropFilter: "blur(6px)", zIndex: 5 }}>
      <AnimatePresence mode="popLayout">
        <motion.div key={n} initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ fontSize: n > 0 ? 520 : 230, fontWeight: 800, lineHeight: 1, color: n > 0 ? "#fff" : "#ffe39a", textShadow: "0 0 80px rgba(255,45,149,.9), 0 12px 0 #ff2d95" }}>{n > 0 ? n : word}</motion.div>
      </AnimatePresence>
    </div>
  );
}

function useVoteQr(code: string, size = 360) {
  const [qr, setQr] = useState("");
  useEffect(() => { QRCode.toDataURL(`${location.origin}/vote?room=${code}`, { margin: 1, width: size, color: { dark: "#06344d", light: "#ffffff" } }).then(setQr); }, [code, size]);
  return qr;
}

function VoteNow({ data, voted, total, prompt }: { data: RoomData; voted: number; total: number; prompt: string }) {
  const qr = useVoteQr(data.code, 440);
  return (
    <div className="stage-layer" style={{ zIndex: 5, background: "rgba(2,28,44,.82)", backdropFilter: "blur(10px)" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} style={{ position: "absolute", left: 110, top: 150, width: 900 }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "0.45em", color: "#ffe39a" }}>📱 VOTING IS OPEN</div>
        <div className="title-pink" style={{ fontSize: 160, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 14 }}>vote on<br />your phone</div>
        <div style={{ marginTop: 34, fontSize: 40, fontWeight: 600, lineHeight: 1.25, opacity: 0.95, maxWidth: 940 }}>“{prompt}”</div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ flex: 1, height: 30, borderRadius: 99, background: "rgba(255,255,255,.18)", overflow: "hidden", maxWidth: 460 }}>
            <motion.div animate={{ width: `${(voted / total) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#ff2d95,#ffd27a)" }} />
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, whiteSpace: "nowrap" }}>{voted}<span style={{ opacity: 0.65, fontSize: 36 }}> / {total} voted</span></div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ position: "absolute", right: 130, top: 190, width: 560, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#fff", padding: 22, borderRadius: 36, boxShadow: "0 0 80px rgba(255,45,149,.6)", lineHeight: 0 }}>{qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} width={440} height={440} alt="Scan to vote" />}</div>
        <div style={{ marginTop: 28, fontSize: 32, fontWeight: 700, letterSpacing: "0.16em", lineHeight: 1.3 }}>SCAN · PICK WHO YOU ARE · VOTE</div>
      </motion.div>
    </div>
  );
}

const sum = (m: Record<string, unknown[]>) => Object.values(m).reduce((a, v) => a + v.length, 0);
const tallyOf = (m: Record<string, number[]>, who: number) => Object.values(m).filter((v) => v.includes(who)).length;

export function GameScreen({ id, data }: { id: GameKey; data: RoomData }) {
  const { state, decks, cast } = data;
  const meta = GAME_META[id];
  const n = ROUNDS.find((r) => r.id === id)!.n;
  const subs = state.subs as Record<string, Sub>;
  const authors = authorsOf(subs);
  const people = peopleOf(data);
  const list: string[] = id === "receipts" ? authors.map((a) => nm(people[a] ?? people[0])) : decks[id];
  const total = list.length;
  const idx = Math.min(state.card, Math.max(total - 1, 0));
  const author = id === "receipts" ? authors[idx] : undefined;
  const sub = author !== undefined ? subs[String(author)] : undefined;
  const authorP = author !== undefined ? people[author] : undefined;
  const prompt = id === "receipts" ? (authorP ? `Which of ${nm(authorP)}'s statements is FAKE?` : "No statements yet — everyone scan the QR and send yours!") : decks[id][idx] ?? "(this deck is empty — add cards in /setup → Games)";
  const picks = id === "canceled" || id === "exposed" ? state.res[id][String(idx)] ?? [] : [];
  const islanders = cast.slice(0, CAST_SIZE);
  const beat = state.beat;
  const votesKey = `${id}:${idx}`; const cardVotes = state.votes[votesKey] ?? {};
  const voted = Object.keys(cardVotes).length; const voters = people.length;
  const voteCount = (who: number) => Object.values(cardVotes).filter((x) => x === who).length;
  const qrSmall = useVoteQr(data.code, 200);
  const runKey = `${state.introKey}-${idx}-${beat}`;

  const header = id === "canceled" ? "MOST LIKELY TO GET CANCELED FOR…" : id === "exposed" ? "NEVER HAVE I EVER…" : null;
  return (
    <div className="stage-layer">
      <Sky dim={0.3} palms={false} sunX={960} tint={`radial-gradient(circle at 50% 45%, ${meta.hue}66, transparent 65%)`} />
      {/* header */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 52, display: "flex", justifyContent: "space-between", alignItems: "center", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>
        <motion.div key={`h${state.introKey}`} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontSize: 66 }}>{meta.icon}</span>
          <div><div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.5em", opacity: 0.9 }}>NIHA ISLAND · ROUND {n}</div><div className="title-pink" style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{meta.title.toLowerCase()}</div></div>
        </motion.div>
        <div className="glass" style={{ borderRadius: 99, padding: "10px 34px", fontSize: 30, fontWeight: 700, letterSpacing: "0.2em", background: "rgba(3,40,66,.5)" }}>CARD {idx + 1} / {total}</div>
      </div>

      {/* card */}
      <AnimatePresence mode="wait">
        <motion.div key={`c${state.introKey}-${idx}`} initial={{ opacity: 0, y: 80, rotateX: -25, scale: 0.92 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={{ opacity: 0, y: -60 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", left: 210, top: id === "receipts" ? 175 : 230, width: 1500, perspective: 1200 }}>
          {id === "receipts" ? (
            <div>
              {authorP ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 26 }}>
                    <Avatar c={authorP} size={120} ring />
                    <div><div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.03em", textShadow: "0 6px 24px rgba(0,30,50,.5)", lineHeight: 1 }}>{nm(authorP)}&apos;s receipts</div><div style={{ marginTop: 8, fontSize: 34, fontWeight: 700, letterSpacing: "0.3em", color: "#ffe39a" }}>ONE IS TRUE · ONE IS FAKE · SPOT THE FAKE</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 40 }}>
                    {(["A", "B"] as const).map((L) => {
                      const text = L === "A" ? sub?.a : sub?.b; const rev = beat >= 2 && sub?.fake; const isFake = rev && sub?.fake === L;
                      return (
                        <motion.div key={L} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (L === "B" ? 0.3 : 0), duration: 0.8 }} style={{ position: "relative", width: 730 }}>
                          <div style={{ background: "#fffdf5", color: "#1b1b1b", padding: "30px 46px 66px", fontFamily: "ui-monospace, Menlo, Consolas, monospace", clipPath: ZIG, minHeight: 300, filter: "drop-shadow(0 20px 40px rgba(0,30,50,.4))", opacity: rev ? (isFake ? 0.85 : 1) : 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: "0.2em", fontWeight: 700 }}><span>RECEIPT {L}</span><span>★ NIHA ISLAND ★</span></div>
                            <div style={{ borderTop: "4px dashed #1b1b1b", margin: "16px 0 20px" }} />
                            <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15, fontFamily: "'Outfit Variable', sans-serif", textDecoration: isFake ? "line-through" : undefined, textDecorationColor: "#e0221c", textDecorationThickness: 6 }}>{text}</div>
                          </div>
                          {rev && <div style={{ position: "absolute", right: 24, bottom: -34 }}><Stamp text={isFake ? "FAKE" : "TRUE"} color={isFake ? "#e0221c" : "#0a9f6b"} size={64} /></div>}
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              ) : <div className="glass" style={{ borderRadius: 48, padding: "60px 80px", background: "rgba(3,40,66,.55)", fontSize: 70, fontWeight: 800, textAlign: "center" }}>{prompt}</div>}
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: 48, padding: "54px 80px", background: "rgba(3,40,66,.55)", borderColor: `${meta.hue}cc`, boxShadow: `0 0 80px ${meta.hue}66, 0 30px 60px rgba(0,30,50,.4)` }}>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "0.25em", color: "#ffe39a", textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>{header}</div>
              <div style={{ marginTop: 20, fontSize: 88, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", textShadow: "0 6px 24px rgba(0,30,50,.5)" }}>{prompt}</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* result stamps */}
      {beat >= 2 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: id === "receipts" ? 870 : 650, display: "flex", flexDirection: id === "canceled" ? "row" : "column", justifyContent: "center", alignItems: "center", gap: id === "canceled" ? 44 : 20, zIndex: 3 }}>
          {id === "receipts" && sub?.fake && authorP && (() => {
            const vs = Object.entries(cardVotes); const caught = vs.filter(([, c]) => c === sub.fake).length; const fooled = vs.length - caught;
            return vs.length ? <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} style={{ fontSize: 46, fontWeight: 700, background: "rgba(3,40,66,.75)", borderRadius: 99, padding: "10px 44px" }}>🕵️ {caught} caught it &nbsp;·&nbsp; 😈 {nm(authorP)} fooled {fooled}</motion.div> : null;
          })()}
          {id === "canceled" && (picks.length ? <><div style={{ display: "flex", gap: 24 }}>{picks.map((w) => <Avatar key={w} c={islanders[w]} size={150} ring />)}</div><Stamp text={`${picks.map((w) => islanders[w].firstName.replace(/[\[\]]/g, "")).join(" & ")} — canceled`} color="#e0127c" size={64} rot={-3} /></> : <Stamp text="Nobody. This time." color="#06344d" size={70} rot={-3} />)}
          {id === "exposed" && <Stamp text={picks.length ? `${picks.length} finger${picks.length > 1 ? "s" : ""} down — exposed!` : "Squeaky clean (liars)"} color={picks.length ? "#e0127c" : "#0a9f6b"} size={62} rot={-3} />}
        </div>
      )}

      {/* roster for the pick-based games */}
      {(id === "canceled" || id === "exposed") && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center", gap: 36, zIndex: 3 }}>
          {islanders.map((c, i) => (
            <div key={c.id} style={{ textAlign: "center", opacity: beat >= 2 && picks.length && !picks.includes(i) ? 0.45 : 1, transition: "opacity .4s" }}>
              <Avatar c={c} size={beat >= 2 ? 112 : 124} ring={picks.includes(i)} badge={picks.includes(i) ? (id === "exposed" ? "👇" : "🚫") : undefined} count={tallyOf(state.res[id], i)} tag={beat >= 2 && state.pv && id === "canceled" && voteCount(i) ? `${voteCount(i)} vote${voteCount(i) === 1 ? "" : "s"}` : undefined} />
              <div style={{ marginTop: 18, fontSize: 24, fontWeight: 700, textShadow: "0 2px 10px rgba(0,30,50,.7)" }}>{c.firstName.replace(/[\[\]]/g, "")}</div>
            </div>
          ))}
        </div>
      )}
      {state.pv && beat !== 1 && qrSmall && (
        <div style={{ position: "absolute", right: 56, bottom: 40, textAlign: "center", zIndex: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSmall} width={150} height={150} alt="Scan to vote" style={{ background: "#fff", padding: 8, borderRadius: 18, boxShadow: "0 8px 24px rgba(0,30,50,.5)" }} />
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, letterSpacing: "0.2em" }}>SCAN TO VOTE</div>
        </div>
      )}
      {beat === 1 && (state.pv ? <VoteNow data={data} voted={voted} total={voters} prompt={prompt} /> : <Countdown word={meta.word} runKey={runKey} />)}
    </div>
  );
}

/** Surprise interruption, layered over whatever scene is on screen. */
export function HotSeatOverlay({ data }: { data: RoomData }) {
  const { hot } = data.state; const who = data.cast[hot.who] ?? data.cast[0];
  const qs = data.decks.hotseat; const q = qs.length ? qs[hot.q % qs.length] : "Tell us everything.";
  return (
    <motion.div key={hot.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stage-layer" style={{ zIndex: 30, background: "radial-gradient(circle at 50% 50%, #5a0b1f 0, #12030a 80%)" }}>
      <div className="stage-layer" style={{ background: "radial-gradient(circle, transparent 35%, #ff3b3b 150%)", animation: "siren 1s ease-in-out infinite" }} />
      <div className="stage-layer" style={{ opacity: 0.35, mixBlendMode: "screen", animation: "spin 5s linear infinite", background: "conic-gradient(from 0deg at 50% 50%, rgba(255,60,60,.95) 0deg 20deg, transparent 20deg 180deg, rgba(255,60,60,.95) 180deg 200deg, transparent 200deg 360deg)", WebkitMaskImage: "radial-gradient(circle, #000 0, transparent 70%)", maskImage: "radial-gradient(circle, #000 0, transparent 70%)" }} />
      <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} style={{ position: "absolute", top: 48, width: "100%", textAlign: "center", fontSize: 40, fontWeight: 700, letterSpacing: "0.6em", color: "#ffd27a" }}>⚠ SURPRISE INTERRUPTION ⚠</motion.div>
      <motion.div initial={{ x: -200, opacity: 0, rotate: -6 }} animate={{ x: 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", left: 150, top: 150 }}>
        <Portrait islander={who} w={520} h={720} gold />
      </motion.div>
      <div style={{ position: "absolute", left: 800, top: 130, width: 1020 }}>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ fontSize: 220, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.05em", textShadow: "0 0 60px #ff2d2d, 6px 6px 0 #ff2d95" }}>HOT SEAT</motion.div>
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="gold-text" style={{ fontSize: 120, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.03em", marginTop: 10 }}>{who.firstName.replace(/[\[\]]/g, "")}</motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="glass" style={{ marginTop: 36, borderRadius: 36, padding: "36px 50px", background: "rgba(90,0,30,.55)", borderColor: "rgba(255,226,150,.7)", fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>“{q}”</motion.div>
      </div>
    </motion.div>
  );
}

function Cake({ lit }: { lit: boolean }) {
  const candles = Array.from({ length: 8 });
  return (
    <svg viewBox="0 0 700 560" width={700} height={560} style={{ overflow: "visible", filter: "drop-shadow(0 30px 40px rgba(60,0,40,.45))" }}>
      <defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8cc8" /><stop offset="1" stopColor="#ff2d95" /></linearGradient><linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3d6" /><stop offset="1" stopColor="#ffd98a" /></linearGradient></defs>
      <ellipse cx="350" cy="520" rx="330" ry="26" fill="#fff" opacity=".55" />
      <rect x="40" y="360" width="620" height="160" rx="30" fill="url(#cg2)" /><path d="M40 395q35 36 70 0t70 0 70 0 70 0 70 0 70 0 70 0 70 0 70 0v-35H40z" fill="#ff2d95" />
      <rect x="120" y="230" width="460" height="140" rx="28" fill="url(#cg1)" /><path d="M120 262q38 34 76 0t76 0 76 0 76 0 76 0 76 0v-32H120z" fill="#fff3d6" />
      <rect x="200" y="110" width="300" height="130" rx="26" fill="url(#cg2)" /><path d="M200 140q30 30 60 0t60 0 60 0 60 0 60 0v-30H200z" fill="#19c3dc" />
      {candles.map((_, i) => { const x = 222 + i * 36; return (<g key={i}><rect x={x} y="52" width="14" height="62" rx="4" fill={i % 2 ? "#ffb02e" : "#ff2d95"} />{lit ? <ellipse cx={x + 7} cy="38" rx="9" ry="18" fill="#ffd45a" style={{ animation: `twinkle ${0.6 + (i % 3) * 0.25}s ease-in-out infinite`, filter: "drop-shadow(0 0 12px #ffb02e)" }} /> : <motion.circle initial={{ cy: 46, r: 8, opacity: 0.7 }} animate={{ cy: -80, r: 26, opacity: 0 }} transition={{ duration: 2.6, delay: i * 0.05 }} cx={x + 7} fill="#cfd8dc" />}</g>); })}
    </svg>
  );
}

function Fireworks() {
  const bursts = useMemo(() => { const R = rng(55); const cols = ["#ff2d95", "#ffd27a", "#19c3dc", "#fff", "#ff7ac0"]; return Array.from({ length: 7 }, (_, i) => ({ x: 160 + R() * 1600, y: 90 + R() * 420, d: i * 0.55, c: cols[i % cols.length] })); }, []);
  return (
    <div className="stage-layer pointer-events-none" style={{ zIndex: 4 }}>
      {bursts.map((b, i) => Array.from({ length: 22 }).map((_, k) => {
        const a = (k / 22) * Math.PI * 2;
        return <motion.span key={`${i}-${k}`} initial={{ x: b.x, y: b.y, opacity: 0, scale: 1 }} animate={{ x: b.x + Math.cos(a) * 230, y: b.y + Math.sin(a) * 230 + 70, opacity: [0, 1, 0], scale: [1, 1, 0.3] }} transition={{ delay: b.d, duration: 1.8, repeat: Infinity, repeatDelay: 3.2, ease: "easeOut" }} style={{ position: "absolute", left: 0, top: 0, width: 14, height: 14, borderRadius: 99, background: b.c, boxShadow: `0 0 18px ${b.c}` }} />;
      }))}
    </div>
  );
}

export function FinaleScreen({ data }: { data: RoomData }) {
  const { state, cast } = data; const stage = state.finale;
  if (stage === 2) return <AwardsScreen data={data} />;
  const niha = cast[CAST_SIZE - 1];
  const nihaName = niha.firstName.replace(/[\[\]]/g, "");
  const canceledTop = topOf(state.res.canceled, cast);
  const exposedTop = topOf(state.res.exposed, cast);
  const people = peopleOf(data); const rs = receiptStats(state);
  const top = (m: Record<number, number>) => { const e = Object.entries(m).sort((a, b) => b[1] - a[1]); if (!e.length) return null; const names = e.filter((x) => x[1] === e[0][1]).map((x) => (people[+x[0]] ? nm(people[+x[0]]) : "")).filter(Boolean); return `${names.join(" & ")} (${e[0][1]})`; };
  const liar = top(rs.fooled), detective = top(rs.caught);
  return (
    <div className="stage-layer" key={state.introKey}>
      <Sky dim={stage ? 0 : 0.35} palms={false} sunX={960} tint="radial-gradient(circle at 50% 40%, rgba(255,45,149,.45), transparent 65%)" />
      <Sparkles count={stage ? 70 : 30} seed={31} />
      {stage === 1 && <><Confetti /><Fireworks /></>}
      <div style={{ position: "absolute", left: 90, top: 190 }}><motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}><Cake lit={stage === 0} /></motion.div></div>
      <div style={{ position: "absolute", left: 830, top: 90, width: 1030 }}>
        <motion.div key={`t${stage}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "0.55em", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>{stage ? "★ MAKE IT COUNT ★" : "NIHA ISLAND · THE FINALE"}</div>
          <div className="gold-text" style={{ fontSize: stage ? 150 : 150, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 10 }}>{stage ? "happy birthday" : "make a wish"}</div>
          <div className="title-pink" style={{ fontSize: stage ? 215 : 260, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.05em", marginTop: stage ? 0 : 18 }}>{nihaName.toLowerCase()}</div>
        </motion.div>
      </div>
    </div>
  );
}

function topOf(m: Record<string, number[]>, cast: Islander[]): string | null {
  const t: Record<number, number> = {}; Object.values(m).forEach((v) => v.forEach((w) => (t[w] = (t[w] ?? 0) + 1)));
  const e = Object.entries(t).sort((a, b) => b[1] - a[1]); if (!e.length) return null;
  const top = e.filter((x) => x[1] === e[0][1]).map((x) => cast[+x[0]]?.firstName.replace(/[\[\]]/g, "")).filter(Boolean);
  return `${top.join(" & ")} (${e[0][1]}×)`;
}
export { sum as _sum };

/** Shown before each game: what it is and how to play. */
export function RoundIntro({ id, data }: { id: GameKey; data: RoomData }) {
  const meta = GAME_META[id]; const info = GAME_INTRO[id];
  const n = ROUNDS.find((r) => r.id === id)!.n; const pv = data.state.pv;
  const qr = useVoteQr(data.code, 240);
  const collect = id === "receipts"; const showQr = pv || collect || id === "awards"; const have = Object.keys(data.state.subs).length; const need = peopleOf(data).length;
  return (
    <div className="stage-layer" key={data.state.introKey}>
      <Sky dim={0.3} palms={false} sunX={960} tint={`radial-gradient(circle at 30% 45%, ${meta.hue}77, transparent 62%)`} />
      <div style={{ position: "absolute", left: 100, top: 90, width: 900 }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span className="glass" style={{ borderRadius: 99, padding: "8px 30px", fontSize: 28, fontWeight: 700, letterSpacing: "0.3em", background: "rgba(3,40,66,.55)" }}>{id === "awards" ? "THE CEREMONY" : `ROUND ${n} OF ${ROUNDS.length - 1}`}</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.4em", textShadow: "0 2px 12px rgba(0,50,80,.7)" }}>NIHA ISLAND</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.4, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: "spring", bounce: 0.5, duration: 1 }} style={{ fontSize: 150, marginTop: 24, lineHeight: 1, filter: "drop-shadow(0 12px 30px rgba(0,30,50,.5))" }}>{meta.icon}</motion.div>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }} className="title-pink" style={{ fontSize: 112, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", marginTop: 10 }}>{meta.title.toLowerCase()}</motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.9 }} className="font-serif" style={{ marginTop: 24, fontSize: 54, fontStyle: "italic", fontWeight: 700, color: "#ffe39a", textShadow: "0 4px 20px rgba(100,40,0,.6)" }}>{info.tagline}</motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.9 }} style={{ marginTop: 26, fontSize: 36, lineHeight: 1.35, fontWeight: 500, textShadow: "0 2px 14px rgba(0,40,70,.8)" }}>{info.what}</motion.p>
      </div>
      <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="glass" style={{ position: "absolute", right: 90, top: 100, width: 720, borderRadius: 44, padding: "40px 46px", background: "rgba(3,40,66,.62)", borderColor: `${meta.hue}cc`, boxShadow: `0 0 70px ${meta.hue}55` }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.4em", color: "#ffe39a" }}>HOW TO PLAY</div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 26 }}>
          {info.how(pv).map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.35, duration: 0.7 }} style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "none", width: 58, height: 58, borderRadius: 99, background: meta.hue, display: "grid", placeItems: "center", fontSize: 32, fontWeight: 800, boxShadow: "0 6px 16px rgba(0,0,0,.35)" }}>{i + 1}</div>
              <div style={{ fontSize: 35, fontWeight: 600, lineHeight: 1.25, paddingTop: 2 }}>{line}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {showQr && qr && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: collect ? 1.6 : 2.6, duration: 0.8 }} className="glass" style={{ position: "absolute", right: 90, bottom: collect ? 60 : 56, borderRadius: 32, padding: "16px 30px 16px 16px", display: "flex", alignItems: "center", gap: 26, background: "rgba(3,40,66,.7)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={150} height={150} alt="Scan to join voting" style={{ background: "#fff", padding: 8, borderRadius: 18 }} />
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25, width: 360 }}>{collect ? <>📱 Scan &amp; send your <b>1 true + 1 fake</b><div style={{ marginTop: 10, fontSize: 40, fontWeight: 800, color: "#ffe39a" }}>{have} / {need} sent</div></> : <>📱 Scan now &amp; pick who you are — voting happens on your phone</>}</div>
        </motion.div>
      )}
    </div>
  );
}

interface Award { icon: string; title: string; who: Islander[]; note: string }
/** Winners of every award that got votes (friend-group awards, voted live on phones). */
function awardsOf(data: RoomData): Award[] {
  const { state, cast, decks } = data; const people = peopleOf(data); const out: Award[] = [];
  decks.awards.forEach((title, i) => {
    const v = state.votes[`awards:${i}`]; if (!v || !Object.keys(v).length) return;
    const t: Record<number, number> = {}; Object.values(v).forEach((x) => { t[x as number] = (t[x as number] ?? 0) + 1; });
    const max = Math.max(...Object.values(t));
    out.push({ icon: "🏆", title, who: Object.keys(t).filter((k) => t[+k] === max).map((k) => people[+k]).filter(Boolean), note: `${max} vote${max === 1 ? "" : "s"}` });
  });
  out.push({ icon: "👑", title: "Birthday Queen", who: [cast[CAST_SIZE - 1]], note: "the main event" });
  return out;
}

function AwardsScreen({ data }: { data: RoomData }) {
  const awards = awardsOf(data);
  return (
    <div className="stage-layer" key={`aw${data.state.introKey}`}>
      <Sky dim={0.18} palms={false} sunX={960} tint="radial-gradient(circle at 50% 30%, rgba(255,210,122,.5), transparent 65%)" />
      <Sparkles count={50} seed={61} /><Confetti />
      <div style={{ position: "absolute", left: 0, right: 0, top: awards.length > 8 ? 70 : 60, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.6em", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>NIHA ISLAND</motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="gold-text" style={{ fontSize: awards.length > 8 ? 110 : 150, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 0 }}>villa awards</motion.div>
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: awards.length > 8 ? 235 : 285, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: awards.length > 8 ? 16 : 22 }}>
        {awards.map((a, i) => (
          <motion.div key={a.title} initial={{ opacity: 0, y: 70, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.8 + i * 0.5, duration: 0.8, type: "spring", bounce: 0.3 }} className="glass"
            style={{ width: awards.length > 8 ? 430 : awards.length > 6 ? 540 : awards.length > 3 ? 700 : 800, borderRadius: awards.length > 8 ? 30 : 40, padding: awards.length > 8 ? "14px 20px" : awards.length > 6 ? "20px 26px" : "28px 34px", background: "rgba(3,40,66,.62)", borderColor: "rgba(255,226,150,.7)", boxShadow: "0 0 60px rgba(255,200,100,.35)" }}>
            <div style={{ fontSize: awards.length > 8 ? 19 : awards.length > 6 ? 24 : 30, fontWeight: 700, letterSpacing: "0.08em", color: "#ffe39a", lineHeight: 1.15, minHeight: awards.length > 8 ? 44 : undefined }}>{a.icon} {a.title.toUpperCase()}</div>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex" }}>{a.who.slice(0, 3).map((w, k) => <div key={w.id} style={{ marginLeft: k ? -26 : 0 }}><Avatar c={w} size={awards.length > 8 ? 68 : awards.length > 6 ? 84 : 100} ring /></div>)}{!a.who.length && <div style={{ fontSize: 80 }}>{a.icon}</div>}</div>
              <div><div style={{ fontSize: awards.length > 8 ? (a.who.length > 1 ? 26 : 36) : awards.length > 6 ? (a.who.length > 1 ? 32 : 42) : (a.who.length > 1 ? 40 : 54), fontWeight: 800, lineHeight: 1.05 }}>{a.who.map(nm).join(" & ") || "The villa"}</div><div style={{ marginTop: 2, fontSize: awards.length > 8 ? 22 : 26, fontWeight: 600, opacity: 0.9 }}>{a.note}</div></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** One award at a time: category → live phone voting → winner reveal. */
export function AwardsRound({ data }: { data: RoomData }) {
  const { state, decks } = data; const people = peopleOf(data);
  const list = decks.awards; const total = list.length; const idx = Math.min(state.card, Math.max(total - 1, 0));
  const title = list[idx] ?? "(no awards yet — add some in /setup → Games)";
  const beat = state.beat; const votes = state.votes[`awards:${idx}`] ?? {}; const voted = Object.keys(votes).length;
  const counts: Record<number, number> = {}; Object.values(votes).forEach((x) => { counts[x as number] = (counts[x as number] ?? 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]); const max = sorted[0]?.[1] ?? 0;
  const winners = sorted.filter((x) => x[1] === max).map((x) => people[+x[0]]).filter(Boolean);
  const runners = sorted.filter((x) => x[1] !== max).slice(0, 4);
  const qrSmall = useVoteQr(data.code, 200);
  return (
    <div className="stage-layer">
      <Sky dim={0.22} palms={false} sunX={960} tint="radial-gradient(circle at 50% 40%, rgba(255,196,61,.55), transparent 65%)" />
      <Sparkles count={36} seed={71} />
      {beat >= 2 && winners.length > 0 && <Confetti />}
      <div style={{ position: "absolute", left: 80, right: 80, top: 52, display: "flex", justifyContent: "space-between", alignItems: "center", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>
        <div><div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.5em", opacity: 0.9 }}>NIHA ISLAND · THE CEREMONY</div><div className="gold-text" style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>the villa awards</div></div>
        <div className="glass" style={{ borderRadius: 99, padding: "10px 34px", fontSize: 30, fontWeight: 700, letterSpacing: "0.2em", background: "rgba(3,40,66,.5)" }}>AWARD {idx + 1} / {total}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`a${state.introKey}-${idx}-${beat >= 2 ? 2 : 0}`} initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", left: 120, right: 120, top: beat >= 2 ? 170 : 220, textAlign: "center" }}>
          {beat < 2 ? (
            <>
              <div style={{ fontSize: 220, lineHeight: 1, filter: "drop-shadow(0 20px 40px rgba(120,60,0,.5))" }}>🏆</div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "0.5em", marginTop: 10, textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>THE AWARD FOR</div>
              <div className="gold-text" style={{ fontSize: title.length > 40 ? 104 : 130, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em", marginTop: 14 }}>{title}</div>
              <div style={{ marginTop: 28, fontSize: 36, fontWeight: 600, opacity: 0.9, textShadow: "0 2px 12px rgba(0,50,80,.6)" }}>Nominees: everyone in the villa</div>
            </>
          ) : winners.length ? (
            <>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "0.4em", color: "#ffe39a", textShadow: "0 2px 12px rgba(0,50,80,.7)" }}>🏆 {title.toUpperCase()}</div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: 18, fontSize: 44, fontWeight: 700, letterSpacing: "0.35em" }}>AND THE WINNER IS…</motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.4, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 1.3, type: "spring", bounce: 0.45, duration: 1 }} style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 36 }}>
                {winners.slice(0, 3).map((w) => <Avatar key={w.id} c={w} size={winners.length > 1 ? 220 : 280} ring />)}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.9 }} className="title-pink" style={{ fontSize: winners.length > 1 ? 110 : 170, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 26 }}>{winners.map(nm).join(" & ").toLowerCase()}</motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }} style={{ marginTop: 14, fontSize: 40, fontWeight: 700 }}>{max} vote{max === 1 ? "" : "s"}{winners.length > 1 ? " each — it's a tie!" : ""}</motion.div>
              {runners.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 26, fontSize: 30, fontWeight: 600 }}>
                  {runners.map(([k, n]) => <span key={k} className="glass" style={{ borderRadius: 99, padding: "6px 24px", background: "rgba(3,40,66,.6)" }}>{people[+k] ? nm(people[+k]) : "?"} · {n}</span>)}
                </motion.div>
              )}
            </>
          ) : (
            <div className="glass" style={{ marginTop: 200, borderRadius: 48, padding: "50px 80px", background: "rgba(3,40,66,.6)", fontSize: 64, fontWeight: 800, display: "inline-block" }}>No votes were cast. Scandal!</div>
          )}
        </motion.div>
      </AnimatePresence>
      {beat !== 1 && qrSmall && (
        <div style={{ position: "absolute", right: 56, bottom: 40, textAlign: "center", zIndex: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSmall} width={150} height={150} alt="Scan to vote" style={{ background: "#fff", padding: 8, borderRadius: 18, boxShadow: "0 8px 24px rgba(0,30,50,.5)" }} />
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, letterSpacing: "0.2em" }}>SCAN TO VOTE</div>
        </div>
      )}
      {beat === 1 && <VoteNow data={data} voted={voted} total={people.length} prompt={title} />}
    </div>
  );
}

const challengeScore = (res: Record<string, string>, duel: Record<string, { a: number; b: number }>, who: number) =>
  Object.entries(res).reduce((n, [k, v]) => { const d = duel[k]; if (!d) return n; return n + ((v === "a" || v === "pass" || v === "both") && d.a === who ? 1 : 0) + ((v === "b" || v === "both") && d.b === who ? 1 : 0); }, 0);

/** Round 3: 5 Second Challenge — solo or head-to-head, host calls the result. */
export function ChallengeRound({ data }: { data: RoomData }) {
  const { state, decks } = data; const people = peopleOf(data);
  const list = decks.redflag; const total = list.length; const idx = Math.min(state.card, Math.max(total - 1, 0));
  const prompt = list[idx] ?? "(no challenges — add some in /setup → Games)";
  const beat = state.beat; const key = String(idx); const duel = state.duel[key]; const result = state.res.redflag[key];
  const solo = duel && duel.b === -1; const pa = duel ? people[duel.a] : undefined; const pb = duel && duel.b >= 0 ? people[duel.b] : undefined;
  const [n, setN] = useState(5);
  useEffect(() => {
    if (beat !== 1) return; setN(5);
    const t = [1, 2, 3, 4, 5].map((i) => setTimeout(() => setN(5 - i), i * 1000)); return () => t.forEach(clearTimeout);
  }, [beat, idx, state.introKey]);
  const score = (w: number) => challengeScore(state.res.redflag, state.duel, w);
  const outcome = !result ? null : result === "pass" ? { t: `${pa ? nm(pa) : ""} nailed it!`, c: "#0a9f6b" } : result === "fail" ? { t: `${pa ? nm(pa) : ""} choked`, c: "#e0221c" } : result === "both" ? { t: "Both nailed it!", c: "#0a9f6b" } : result === "none" ? { t: "Both failed. Iconic.", c: "#e0221c" } : { t: `${(result === "a" ? pa : pb) ? nm((result === "a" ? pa : pb) as Islander) : ""} wins!`, c: "#e0127c" };
  const Contestant = ({ c, win }: { c: Islander; win: boolean }) => (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: win ? 1.12 : 1, opacity: beat >= 2 && result && !win && result !== "both" && result !== "none" && result !== "fail" ? 0.45 : 1 }} transition={{ type: "spring", bounce: 0.4 }} style={{ textAlign: "center" }}>
      <Avatar c={c} size={solo ? 240 : 220} ring={win || beat === 1} tag={score(people.indexOf(c)) ? `${score(people.indexOf(c))} pt${score(people.indexOf(c)) === 1 ? "" : "s"}` : undefined} />
      <div style={{ marginTop: 26, fontSize: 48, fontWeight: 800, textShadow: "0 3px 14px rgba(0,30,50,.7)" }}>{nm(c)}</div>
    </motion.div>
  );
  return (
    <div className="stage-layer">
      <Sky dim={0.3} palms={false} sunX={960} tint="radial-gradient(circle at 50% 45%, rgba(255,90,60,.5), transparent 65%)" />
      <div style={{ position: "absolute", left: 80, right: 80, top: 52, display: "flex", justifyContent: "space-between", alignItems: "center", textShadow: "0 2px 14px rgba(0,50,80,.7)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}><span style={{ fontSize: 66 }}>⏱️</span><div><div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.5em", opacity: 0.9 }}>NIHA ISLAND · ROUND 3</div><div className="title-pink" style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>5 second challenge</div></div></div>
        <div className="glass" style={{ borderRadius: 99, padding: "10px 34px", fontSize: 30, fontWeight: 700, letterSpacing: "0.2em", background: "rgba(3,40,66,.5)" }}>CHALLENGE {idx + 1} / {total}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`ch${state.introKey}-${idx}`} initial={{ opacity: 0, y: 70, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass" style={{ position: "absolute", left: 160, right: 160, top: 190, borderRadius: 48, padding: "36px 70px", background: "rgba(3,40,66,.58)", borderColor: "rgba(255,120,80,.8)", boxShadow: "0 0 70px rgba(255,90,60,.4)" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.35em", color: "#ffe39a" }}>{solo ? "SOLO CHALLENGE" : pb ? "HEAD TO HEAD" : "THE CHALLENGE"}</div>
          <div style={{ marginTop: 12, fontSize: prompt.length > 70 ? 66 : 80, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", textShadow: "0 6px 24px rgba(0,30,50,.5)" }}>{prompt}</div>
        </motion.div>
      </AnimatePresence>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", alignItems: "center", gap: 120 }}>
        {pa ? (
          <>
            <Contestant c={pa} win={beat >= 2 && (result === "a" || result === "pass" || result === "both")} />
            {pb && (
              <div style={{ width: 300, textAlign: "center" }}>
                {beat === 1 ? <motion.div key={n} initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: n > 0 ? 260 : 120, fontWeight: 800, lineHeight: 1, color: n > 0 ? "#fff" : "#ffe39a", textShadow: "0 0 70px rgba(255,45,149,.9), 0 10px 0 #ff2d95" }}>{n > 0 ? n : "TIME!"}</motion.div> : <div style={{ fontSize: 130, fontWeight: 800, color: "#ffe39a", textShadow: "0 8px 0 #ff2d95" }}>VS</div>}
              </div>
            )}
            {pb && <Contestant c={pb} win={beat >= 2 && (result === "b" || result === "both")} />}
            {solo && beat === 1 && <motion.div key={n} initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: n > 0 ? 280 : 130, fontWeight: 800, lineHeight: 1, color: n > 0 ? "#fff" : "#ffe39a", textShadow: "0 0 70px rgba(255,45,149,.9), 0 10px 0 #ff2d95" }}>{n > 0 ? n : "TIME!"}</motion.div>}
          </>
        ) : <div className="glass" style={{ borderRadius: 40, padding: "30px 60px", fontSize: 50, fontWeight: 700, background: "rgba(3,40,66,.55)" }}>Waiting for the host to call someone out…</div>}
      </div>
      {beat >= 2 && outcome && <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center", zIndex: 4 }}><Stamp text={outcome.t} color={outcome.c} size={64} rot={-3} /></div>}
    </div>
  );
}
