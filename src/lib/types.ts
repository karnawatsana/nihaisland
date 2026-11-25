export interface Stat { label: string; value: number }
export interface Islander {
  id: string;
  firstName: string;
  nickname: string;
  bio: string;
  stats: Stat[];
  quote: string;
  photo: string | null;
  accent: string;
  birthday?: boolean;
}
export interface PosterConfig {
  portrait: string | null; // transparent PNG/WebP (or any photo)
  x: number;      // px offset in the 1920 stage
  y: number;
  scale: number;  // 1 = default height
  flip: boolean;
  cutout?: boolean; // true when the portrait has transparent edges (background removed)
}
export interface PresState {
  step: number;
  paused: boolean;
  muted: boolean;
  introKey: number; // bump to replay the animation of the current scene
  changedAt: number;
}
export type Command =
  | { type: "next" } | { type: "prev" }
  | { type: "goto"; step: number }
  | { type: "openPoster" } | { type: "replayOpening" }
  | { type: "startCast" } | { type: "bombshell" }
  | { type: "restart" } | { type: "standby" }
  | { type: "togglePause" } | { type: "toggleMute" }
  | { type: "enter" };
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
