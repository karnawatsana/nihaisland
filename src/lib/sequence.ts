import type { Islander } from "./types";

/**
 * The whole show is one linear list of steps. The host's Next/Prev simply move through it.
 * PHASE 2: replace a `round` placeholder with a real game component in components/rounds.tsx
 * (registry by round id) — the host dashboard and sync layer need no changes.
 */
export type Step =
  | { kind: "standby" } | { kind: "poster" } | { kind: "host" }
  | { kind: "cast"; index: number }
  | { kind: "bombshell" }
  | { kind: "round"; id: RoundId }
  | { kind: "hotseat" } | { kind: "finale" };

export type RoundId = "receipts" | "canceled" | "redflag" | "exposed";

export const ROUNDS: { id: RoundId; n: number; title: string; tag: string; icon: string; hue: string }[] = [
  { id: "receipts", n: 1, title: "The Villa Has Receipts", tag: "Screenshots never lie.", icon: "🧾", hue: "#19c3dc" },
  { id: "canceled", n: 2, title: "Most Likely to Get Canceled", tag: "Vote. Regret. Repeat.", icon: "🚫", hue: "#ff2d95" },
  { id: "redflag", n: 3, title: "Red Flag or Just a Personality?", tag: "Defend your choices.", icon: "🚩", hue: "#ff5a3c" },
  { id: "exposed", n: 4, title: "Never Have I Ever: Exposed", tag: "Fingers down. Truth up.", icon: "🤫", hue: "#ffb02e" },
];

export const CAST_SIZE = 8; // 7 islanders + birthday bombshell (last)

export const STEPS: Step[] = [
  { kind: "standby" },
  { kind: "poster" },
  { kind: "host" },
  ...Array.from({ length: CAST_SIZE - 1 }, (_, i) => ({ kind: "cast", index: i }) as Step),
  { kind: "bombshell" },
  ...ROUNDS.map((r) => ({ kind: "round", id: r.id }) as Step),
  { kind: "hotseat" },
  { kind: "finale" },
];

export const STEP = {
  standby: 0,
  poster: 1,
  host: 2,
  firstCast: 3,
  bombshell: 3 + (CAST_SIZE - 1),
  lastStep: STEPS.length - 1,
};

export function stepLabel(step: number, cast: Islander[], hostName?: string): string {
  const s = STEPS[step];
  if (!s) return "—";
  switch (s.kind) {
    case "standby": return "Standby screen";
    case "poster": return "Title poster";
    case "host": return `Host intro · ${hostName ?? ""}`;
    case "cast": return `Islander ${s.index + 1}/${CAST_SIZE - 1} · ${cast[s.index]?.firstName ?? ""}`;
    case "bombshell": return `Birthday Bombshell · ${cast[CAST_SIZE - 1]?.firstName ?? ""}`;
    case "round": { const r = ROUNDS.find((x) => x.id === s.id)!; return `Round ${r.n} · ${r.title}`; }
    case "hotseat": return "Hot Seat (placeholder)";
    case "finale": return "Birthday Finale (placeholder)";
  }
}
