"use client";
import { useLayoutEffect, useRef, useState } from "react";

/** A fixed 1920×1080 canvas scaled to fit (TV-perfect 16:9 everywhere). `contained` fits its parent instead of the window. */
export function Stage({ children, contained = false }: { children: React.ReactNode; contained?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const fit = () => {
      const el = host.current; if (!el) return;
      const w = contained ? el.clientWidth : window.innerWidth;
      const h = contained ? el.clientHeight : window.innerHeight;
      setScale(Math.min(w / 1920, h / 1080));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (host.current) ro.observe(host.current);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, [contained]);
  return (
    <div ref={host} className={contained ? "relative h-full w-full overflow-hidden bg-black" : "fixed inset-0 overflow-hidden bg-black"}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${scale})`, transformOrigin: "center", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
