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
  const verdict = id === "redflag" ? state.res.redflag[String(idx)] : undefined;
  const islanders = cast.slice(0, CAST_SIZE);
  const beat = state.beat;
  const votesKey = `${id}:${idx}`; const cardVotes = state.votes[votesKey] ?? {};
  const voted = Object.keys(cardVotes).length; const voters = people.length;
  const voteCount = (who: number) => Object.values(cardVotes).filter((x) => x === who).length;
  const qrSmall = useVoteQr(data.code, 200);
  const runKey = `${state.introKey}-${idx}-${beat}`;

  const header = id === "canceled" ? "MOST LIKELY TO GET CANCELED FOR…" : id === "redflag" ? "RED FLAG — OR JUST A PERSONALITY?" : id === "exposed" ? "NEVER HAVE I EVER…" : null;
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
          {id === "redflag" && state.pv && voted > 0 && <div style={{ fontSize: 44, fontWeight: 800, background: "rgba(3,40,66,.7)", borderRadius: 99, padding: "6px 36px" }}>🚩 {Object.values(cardVotes).filter((x) => x === "red").length} &nbsp;·&nbsp; ✅ {Object.values(cardVotes).filter((x) => x === "ok").length}</div>}
          {id === "redflag" && (verdict === "red" ? <Stamp text="🚩 Red flag" color="#e0221c" size={110} /> : verdict === "ok" ? <Stamp text="✅ Just a personality" color="#0a9f6b" size={90} /> : <Stamp text="Hung jury" color="#06344d" size={90} />)}
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
  const niha = cast[CAST_SIZE - 1];
  const nihaName = niha.firstName.replace(/[\[\]]/g, "");
  const canceledTop = topOf(state.res.canceled, cast);
  const exposedTop = topOf(state.res.exposed, cast);
  const reds = Object.values(state.res.redflag).filter((v) => v === "red").length;
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
        {stage === 1 && (canceledTop || exposedTop || reds > 0 || liar || detective) && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 1 }} className="glass" style={{ marginTop: 24, borderRadius: 32, padding: "20px 36px", background: "rgba(3,40,66,.55)", fontSize: 32, fontWeight: 600, lineHeight: 1.45 }}>
            <div style={{ fontSize: 26, letterSpacing: "0.4em", color: "#ffe39a", fontWeight: 700 }}>VILLA AWARDS</div>
            {liar && <div>😈 Best liar: <b>{liar}</b> fooled</div>}
            {detective && <div>🕵️ Sharpest detective: <b>{detective}</b> caught</div>}
            {canceledTop && <div>🚫 Most canceled: <b>{canceledTop}</b></div>}
            {exposedTop && <div>🤫 Most exposed: <b>{exposedTop}</b></div>}
            {reds > 0 && <div>🚩 Red flags called tonight: <b>{reds}</b></div>}
          </motion.div>
        )}
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
  const collect = id === "receipts"; const have = Object.keys(data.state.subs).length; const need = peopleOf(data).length;
  return (
    <div className="stage-layer" key={data.state.introKey}>
      <Sky dim={0.3} palms={false} sunX={960} tint={`radial-gradient(circle at 30% 45%, ${meta.hue}77, transparent 62%)`} />
      <div style={{ position: "absolute", left: 100, top: 90, width: 900 }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span className="glass" style={{ borderRadius: 99, padding: "8px 30px", fontSize: 28, fontWeight: 700, letterSpacing: "0.3em", background: "rgba(3,40,66,.55)" }}>ROUND {n} OF {ROUNDS.length}</span>
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
      {(pv || collect) && qr && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: collect ? 1.6 : 2.6, duration: 0.8 }} className="glass" style={{ position: "absolute", right: 90, bottom: collect ? 60 : 56, borderRadius: 32, padding: "16px 30px 16px 16px", display: "flex", alignItems: "center", gap: 26, background: "rgba(3,40,66,.7)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={150} height={150} alt="Scan to join voting" style={{ background: "#fff", padding: 8, borderRadius: 18 }} />
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25, width: 360 }}>{collect ? <>📱 Scan &amp; send your <b>1 true + 1 fake</b><div style={{ marginTop: 10, fontSize: 40, fontWeight: 800, color: "#ffe39a" }}>{have} / {need} sent</div></> : <>📱 Scan now &amp; pick who you are — voting happens on your phone</>}</div>
        </motion.div>
      )}
    </div>
  );
}
