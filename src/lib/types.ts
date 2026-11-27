export interface Stat { label: string; value: number }
export interface Islander {
  id: string;
  firstName: string;
  nickname: string;
  bio: string;
  stats: Stat[];
  quote: string;
  photo: string | null;
  photoCutout?: boolean; // transparent background → shown bottom-anchored on the colour backdrop
  accent: string;
  birthday?: boolean;
}
export interface PosterConfig {
  portrait: string | null; // transparent PNG/WebP (or any photo)
  x: number;      // px offset in the 1920 stage
  y: number;
  scale: number;  // 1 = default height
  flip: boolean;
  host?: Islander; // the host intro card (stored alongside the poster settings)
  decks?: Decks;   // editable game content (stored alongside the poster settings)
  cutout?: boolean; // true when the portrait has transparent edges (background removed)
}
export type GameKey = "receipts" | "canceled" | "redflag" | "exposed";
export interface Decks {
  receipts: { q: string; reveal: string }[];
  canceled: string[];
  redflag: string[];
  exposed: string[];
  hotseat: string[];
}
export interface GameResults {
  receipts: Record<string, number[]>;           // card index -> islanders the group pointed at
  canceled: Record<string, number[]>;           // card index -> islander indexes who got "canceled"
  exposed: Record<string, number[]>;            // card index -> islander indexes who put a finger down
  redflag: Record<string, "red" | "ok">;        // card index -> verdict
}
export interface HotSeat { on: boolean; who: number; q: number; key: number }
export interface PresState {
  step: number;
  paused: boolean;
  muted: boolean;
  introKey: number; // bump to replay the animation of the current scene
  changedAt: number;
  card: number;      // current card in a game round
  beat: number;      // 0 prompt · 1 countdown/vote · 2 result
  res: GameResults;
  hot: HotSeat;      // surprise Hot Seat overlay (works on top of any scene)
  finale: number;    // 0 candles lit · 1 blown out
  pv: boolean;       // phone voting on/off for game rounds
  votes: Record<string, Record<string, string | number>>; // "round:card" -> voter index -> choice
  subs: Record<string, { a: string; b: string; fake?: "A" | "B" }>; // guest statements for Receipts (fake is hidden from clients until revealed)
  rev: number[];     // authors whose receipt card has been revealed
}
export type Command =
  | { type: "next" } | { type: "prev" }
  | { type: "goto"; step: number }
  | { type: "openPoster" } | { type: "replayOpening" }
  | { type: "startCast" } | { type: "bombshell" }
  | { type: "restart" } | { type: "standby" }
  | { type: "togglePause" } | { type: "toggleMute" }
  | { type: "enter" }
  | { type: "gnext" } | { type: "gprev" }
  | { type: "mark"; who: number } | { type: "verdict"; v: "red" | "ok" }
  | { type: "hotStart"; who: number; q: number } | { type: "hotEnd" }
  | { type: "finale"; stage: number }
  | { type: "pv"; on: boolean }
  | { type: "submit"; voter: number; t: string; f: string; flip?: boolean }
  | { type: "vote"; voter: number; choice: string | number };
export interface RoomView {
  code: string;
  demo: boolean;
  version: number;
  contentVersion: number;
  state: PresState;
  cast?: Islander[];
  poster?: PosterConfig;
  serverTime: number;
}
export const STAT_LABELS = ["Drama Potential", "Delusion Level", "Loyalty", "Self-Awareness"];
