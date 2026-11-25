/** Elegant placeholder shown whenever a photo is missing (never a fake face). */
export function Silhouette({ color = "#ff2d95", label, initial, className = "" }: { color?: string; label?: string; initial?: string; className?: string }) {
  const id = `sg${color.slice(1)}`;
  return (
    <div className={`relative flex h-full w-full items-end justify-center ${className}`}>
      <svg viewBox="0 0 400 600" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".95" /><stop offset="1" stopColor="#3a0b52" stopOpacity=".95" /></linearGradient>
          <radialGradient id={`${id}g`} cx="50%" cy="38%" r="55%"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        <g>
          <path d="M200 40c-78 0-122 56-122 140 0 70 14 120-6 170-6 16-20 30-30 44h316c-10-14-24-28-30-44-20-50-6-100-6-170 0-84-44-140-122-140z" fill={`url(#${id})`} opacity=".75" />
          <path d="M165 330h70l14 100h-98z" fill={`url(#${id})`} />
          <path d="M10 600c8-110 60-170 150-196l40 28 40-28c90 26 142 86 150 196z" fill={`url(#${id})`} />
          <ellipse cx="200" cy="245" rx="58" ry="76" fill={`url(#${id})`} />
          <path d="M142 232c10-60 50-84 100-70 30 8 44 34 44 70-30-40-80-52-144 0z" fill={`url(#${id})`} opacity=".9" />
          <ellipse cx="200" cy="250" rx="140" ry="260" fill={`url(#${id}g)`} />
        </g>
      </svg>
      {initial && <div className="absolute left-1/2 top-[22%] -translate-x-1/2 text-[min(18vw,120px)] font-extrabold text-white/80" style={{ fontSize: "clamp(40px, 9cqw, 220px)", textShadow: "0 4px 30px rgba(0,0,0,.35)" }}>{initial}</div>}
      {label && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-4 py-1 text-[11px] font-semibold uppercase tracking-[.2em] text-white/90">{label}</div>}
    </div>
  );
}
