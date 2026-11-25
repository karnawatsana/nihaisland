"use client";
import { AnimatePresence, motion } from "motion/react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { useRoom, type RoomData, type Status } from "@/lib/useRoom";
import { STEPS, CAST_SIZE } from "@/lib/sequence";
import { sfx } from "@/lib/audio";
import { Stage } from "./Stage";
import { Poster } from "./Poster";
import { CastReveal } from "./CastReveal";
import { Bombshell } from "./Bombshell";
import { FinaleScreen, HotSeatScreen, RoundScreen } from "./rounds";
import { Sky } from "./Sky";

function Standby({ code, demo }: { code: string; demo: boolean }) {
  const [qr, setQr] = useState("");
  useEffect(() => { QRCode.toDataURL(`${location.origin}/host?room=${code}`, { margin: 1, width: 360, color: { dark: "#06344d", light: "#ffffff" } }).then(setQr); }, [code]);
  return (
    <div className="stage-layer">
      <Sky dim={0.12} palms />
      <div className="stage-layer flex flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.55em", textShadow: "0 2px 14px rgba(0,60,90,.6)" }}>NYC ORIGINAL</div>
          <div className="title-pink" style={{ fontSize: 210, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 0.9, marginTop: 14 }}>niha island</div>
        </motion.div>
        <div className="glass" style={{ marginTop: 56, borderRadius: 36, padding: "26px 56px", display: "flex", alignItems: "center", gap: 48, background: "rgba(3,40,66,.5)" }}>
          {qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="Scan to open the host remote" width={190} height={190} style={{ borderRadius: 16 }} />}
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 26, letterSpacing: "0.3em", fontWeight: 600, opacity: 0.9 }}>{demo ? "DEMO ROOM" : "ROOM CODE"}</div>
            <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: "0.12em", lineHeight: 1, color: "#ffe39a" }}>{code}</div>
            <div style={{ fontSize: 28, fontWeight: 500, opacity: 0.95, marginTop: 6 }}>Scan with the host&apos;s phone · waiting for the host…</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scene({ data, onEnter, setReveal }: { data: RoomData; onEnter: () => void; setReveal: () => void }) {
  const { state, cast, poster, demo } = data;
  const step = STEPS[state.step];
  switch (step.kind) {
    case "standby": return <Standby code={data.code} demo={demo} />;
    case "poster": return <Poster config={poster} introKey={state.introKey} interactive onEnter={onEnter} demo={demo} />;
    case "host": return poster.host ? <CastReveal islander={poster.host} index={1} total={1} introKey={state.introKey} badge="★ YOUR HOST ★" /> : <Standby code={data.code} demo={demo} />;
    case "cast": return <CastReveal islander={cast[step.index]} index={step.index} total={CAST_SIZE - 1} introKey={state.introKey} />;
    case "bombshell": return <Bombshell islander={cast[CAST_SIZE - 1]} introKey={state.introKey} fallbackPhoto={poster.portrait} onReveal={setReveal} />;
    case "round": return <RoundScreen id={step.id} introKey={state.introKey} />;
    case "hotseat": return <HotSeatScreen introKey={state.introKey} />;
    case "finale": return <FinaleScreen introKey={state.introKey} />;
  }
}

const statusText: Record<Status, string> = { connecting: "Connecting…", live: "Live", offline: "Reconnecting…", missing: "Room not found" };

export function Presentation({ code, contained = false }: { code: string; contained?: boolean }) {
  const { data, status, send } = useRoom(code);
  const [soundOk, setSoundOk] = useState(false);
  const prev = useRef<string>("");

  useEffect(() => { // unlock audio on any interaction
    const un = async () => { if (await sfx.unlock()) { setSoundOk(true); } };
    window.addEventListener("pointerdown", un); window.addEventListener("keydown", un);
    return () => { window.removeEventListener("pointerdown", un); window.removeEventListener("keydown", un); };
  }, []);
  useEffect(() => { if (data) sfx.muted = data.state.muted || data.state.paused; }, [data?.state.muted, data?.state.paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sound cues when the scene changes (not on first load / refresh)
  const sceneKey = data ? `${data.state.step}:${data.state.introKey}` : "";
  useEffect(() => {
    if (!data) return;
    if (prev.current && prev.current !== sceneKey) {
      const k = STEPS[data.state.step].kind;
      if (k === "poster") sfx.opening();
      else if (k === "cast" || k === "host") sfx.reveal();
      else if (k === "bombshell") sfx.siren();
      else if (k === "hotseat") sfx.siren();
      else if (k === "finale") sfx.fanfare();
      else if (k !== "standby") sfx.whoosh();
    }
    prev.current = sceneKey;
  }, [sceneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stage contained={contained}>
      {!data ? (
        <div className="stage-layer flex items-center justify-center" style={{ background: "#02121c", fontSize: 40, letterSpacing: "0.4em", fontWeight: 600 }}>
          {status === "missing" ? <div className="text-center"><div className="title-pink" style={{ fontSize: 120, fontWeight: 800 }}>room not found</div><div style={{ fontSize: 30, marginTop: 20, opacity: 0.8 }}>Check the room code “{code}” · <a href="/play" style={{ textDecoration: "underline" }}>try another</a></div></div> : statusText[status].toUpperCase()}
        </div>
      ) : (
        <>
          <AnimatePresence mode="sync">
            <motion.div key={sceneKey} className="stage-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
              <Scene data={data} onEnter={() => { sfx.unlock().then(() => setSoundOk(true)); send({ type: "enter" }); }} setReveal={() => sfx.fanfare()} />
            </motion.div>
          </AnimatePresence>
          {/* pink wipe on every scene change */}
          <motion.div key={`w${sceneKey}`} initial={{ x: "-110%" }} animate={{ x: "110%" }} transition={{ duration: 1.0, ease: [0.7, 0, 0.3, 1] }} className="stage-layer pointer-events-none"
            style={{ display: prev.current === "" || data.state.step === 0 ? "none" : "block", background: "linear-gradient(100deg,transparent 30%,#ff2d95 45%,#ffd27a 55%,transparent 70%)", mixBlendMode: "screen", opacity: 0.85 }} />
          {data.state.paused && (
            <div className="stage-layer flex flex-col items-center justify-center" style={{ background: "rgba(2,18,28,.72)", backdropFilter: "blur(16px)", zIndex: 40 }}>
              <div className="title-pink" style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.04em" }}>paused</div>
              <div style={{ fontSize: 40, letterSpacing: "0.4em", fontWeight: 600 }}>WE&apos;LL BE RIGHT BACK IN THE VILLA</div>
            </div>
          )}
          {status !== "live" && <div style={{ position: "absolute", top: 24, right: 28, zIndex: 50, borderRadius: 99, padding: "8px 22px", fontSize: 22, fontWeight: 600, letterSpacing: "0.2em", background: "rgba(255,160,0,.9)", color: "#2a1500" }}>{statusText[status].toUpperCase()}</div>}
          {!soundOk && !data.state.muted && (
            <div style={{ position: "absolute", left: 28, top: 24, zIndex: 50, borderRadius: 99, padding: "8px 22px", fontSize: 20, fontWeight: 600, letterSpacing: "0.18em", background: "rgba(3,40,66,.6)", border: "1px solid rgba(255,255,255,.4)", opacity: 0.85 }}>🔊 CLICK ANYWHERE TO ENABLE SOUND</div>
          )}
        </>
      )}
    </Stage>
  );
}
