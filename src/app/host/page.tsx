"use client";
import { useEffect, useState } from "react";
import { HostPanel } from "@/components/HostPanel";
import { HostLogin } from "@/components/HostLogin";
import { Shell } from "@/components/Shell";
import { getToken, login } from "@/lib/useRoom";

const KEY = "niha:hostRoom";

export default function Host() {
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [prefill, setPrefill] = useState("");
  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams(location.search);
      const q = sp.get("room")?.toUpperCase() ?? "";
      let saved = ""; try { saved = localStorage.getItem(KEY) ?? ""; } catch {}
      const c = q || saved;
      setPrefill(c);
      const pin = sp.get("pin");
      if (c && pin && (await login(c, pin)).token) { try { localStorage.setItem(KEY, c); } catch {} history.replaceState(null, "", `/host?room=${c}`); setCode(c); return; }
      if (c && getToken(c)) { setCode(c); return; }
      setCode(null);
    })();
  }, []);
  if (code === undefined) return <Shell><div className="p-10 text-center">…</div></Shell>;
  return (
    <Shell>
      {code ? (
        <HostPanel code={code} onLogout={() => { try { localStorage.removeItem(KEY); localStorage.removeItem(`niha:token:${code}`); } catch {} setCode(null); }} />
      ) : (
        <div className="px-4 pt-6"><div className="text-center"><div className="title-pink text-5xl font-extrabold">niha island</div><div className="mt-1 text-xs font-semibold uppercase tracking-[.35em]">Host remote</div></div>
          <HostLogin initialCode={prefill} onDone={(c) => { try { localStorage.setItem(KEY, c); } catch {} setCode(c); }} /></div>
      )}
    </Shell>
  );
}
