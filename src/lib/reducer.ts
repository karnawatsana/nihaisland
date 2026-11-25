import type { Command, PresState } from "./types";
import { STEP } from "./sequence";

export const initialState = (now = Date.now()): PresState => ({
  step: STEP.standby, paused: false, muted: false, introKey: 0, changedAt: now,
});

const clamp = (n: number) => Math.max(0, Math.min(STEP.lastStep, n));

/** Pure & shared: the server applies it, clients never mutate state directly. */
export function reduce(s: PresState, c: Command, now = Date.now()): PresState {
  const go = (step: number, replay = true): PresState => ({
    ...s, step: clamp(step), paused: false, introKey: replay ? s.introKey + 1 : s.introKey, changedAt: now,
  });
  switch (c.type) {
    case "next": return go(s.step + 1);
    case "prev": return go(s.step - 1);
    case "goto": return go(c.step);
    case "openPoster": return go(STEP.poster);
    case "replayOpening": return { ...go(STEP.poster) };
    case "startCast": return go(STEP.firstCast);
    case "bombshell": return go(STEP.bombshell);
    case "restart": return go(STEP.poster);
    case "standby": return go(STEP.standby);
    case "enter": return s.step === STEP.poster ? go(STEP.firstCast) : s;
    case "togglePause": return { ...s, paused: !s.paused, changedAt: now };
    case "toggleMute": return { ...s, muted: !s.muted, changedAt: now };
  }
}
