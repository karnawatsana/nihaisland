import type { Command, PresState } from "./types";
import { STEP, STEPS, type RoundId } from "./sequence";

export const initialState = (now = Date.now()): PresState => ({
  step: STEP.standby, paused: false, muted: false, introKey: 0, changedAt: now,
  card: 0, beat: 0, res: { canceled: {}, exposed: {}, redflag: {} },
  hot: { on: false, who: 0, q: 0, key: 0 }, finale: 0,
});

/** Older rooms were saved before games existed: fill any missing fields. */
export function norm(s: Partial<PresState> & { step: number }): PresState {
  const i = initialState(s.changedAt ?? 0);
  return { ...i, ...s, res: { ...i.res, ...(s.res ?? {}) }, hot: { ...i.hot, ...(s.hot ?? {}) } } as PresState;
}

const clamp = (n: number) => Math.max(0, Math.min(STEP.lastStep, n));
export interface Ctx { lens: Partial<Record<RoundId, number>> }

const roundOf = (step: number): RoundId | null => { const s = STEPS[step]; return s.kind === "round" ? s.id : null; };

/** Pure & shared: the server applies it, clients never mutate state directly. */
export function reduce(s0: PresState, c: Command, now = Date.now(), ctx: Ctx = { lens: {} }): PresState {
  const s = norm(s0);
  const go = (step: number, replay = true): PresState => ({
    ...s, step: clamp(step), paused: false, introKey: replay ? s.introKey + 1 : s.introKey, changedAt: now,
    card: 0, beat: 0, finale: 0, hot: { ...s.hot, on: false },
  });
  const round = roundOf(s.step);
  const key = String(s.card);
  switch (c.type) {
    case "next": return go(s.step + 1);
    case "prev": return go(s.step - 1);
    case "goto": return go(c.step);
    case "openPoster": return go(STEP.poster);
    case "replayOpening": return { ...go(STEP.poster) };
    case "startCast": return go(STEP.host);
    case "bombshell": return go(STEP.bombshell);
    case "restart": return go(STEP.poster);
    case "standby": return go(STEP.standby);
    case "enter": return s.step === STEP.poster ? go(STEP.host) : s;
    case "togglePause": return { ...s, paused: !s.paused, changedAt: now };
    case "toggleMute": return { ...s, muted: !s.muted, changedAt: now };
    case "gnext": {
      if (!round) return s;
      const len = ctx.lens[round] ?? 99;
      if (s.beat < 2) return { ...s, beat: s.beat + 1, changedAt: now };
      if (s.card < len - 1) return { ...s, card: s.card + 1, beat: 0, changedAt: now };
      return s;
    }
    case "gprev": {
      if (!round) return s;
      if (s.beat > 0) return { ...s, beat: s.beat - 1, changedAt: now };
      if (s.card > 0) return { ...s, card: s.card - 1, beat: 2, changedAt: now };
      return s;
    }
    case "mark": {
      if (round !== "canceled" && round !== "exposed") return s;
      const cur = s.res[round][key] ?? [];
      const next = cur.includes(c.who) ? cur.filter((x) => x !== c.who) : [...cur, c.who];
      return { ...s, res: { ...s.res, [round]: { ...s.res[round], [key]: next } }, changedAt: now };
    }
    case "verdict": {
      if (round !== "redflag") return s;
      const res = { ...s.res.redflag };
      if (res[key] === c.v) delete res[key]; else res[key] = c.v;
      return { ...s, res: { ...s.res, redflag: res }, changedAt: now };
    }
    case "hotStart": return { ...s, hot: { on: true, who: c.who, q: c.q, key: s.hot.key + 1 }, changedAt: now };
    case "hotEnd": return { ...s, hot: { ...s.hot, on: false }, changedAt: now };
    case "finale": return s.step === STEP.finale ? { ...s, finale: c.stage, changedAt: now } : s;
  }
}
