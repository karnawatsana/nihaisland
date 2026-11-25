import { Sky } from "./Sky";
import { Stage } from "./Stage";

/** Full-bleed island backdrop for non-TV pages (host, setup, demo). */
export function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-0"><Stage><Sky dim={0.25} palms={false} /></Stage></div>
      <div className={`relative z-10 ${wide ? "" : ""}`}>{children}</div>
    </div>
  );
}
