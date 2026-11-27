import type { Command, PresState } from "./types";
import { STEP, STEPS, gameStep, type RoundId } from "./sequence";

export const initialState = (now = Date.now()): PresState => ({
  step: STEP.standby, paused: false, muted: false, introKey: 0, changedAt: now,
  card: 0, beat: 0, res: { receipts: {}, canceled: {}, exposed: {}, redflag: {} },
  hot: { on: false, who: 0, q: 0, key: 0 }, finale: 0, pv: false, votes: {}, subs: {}, rev: [], duel: {},
});

/** Older rooms were saved before games existed: fill any missing fields. */
export function norm(s: Partial<PresState> & { step: number }): PresState {
  const i = initialState(s.changedAt ?? 0);
  return { ...i, ...s, res: { ...i.res, ...(s.res ?? {}) }, hot: { ...i.hot, ...(s.hot ?? {}) }, votes: s.votes ?? {}, subs: s.subs ?? {}, rev: s.rev ?? [], duel: s.duel ?? {} } as PresState;
}

const clamp = (n: number) => Math.max(0, Math.min(STEP.lastStep, n));
export interface Ctx { lens: Partial<Record<RoundId, number>>; authors?: number[] }

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
      if (s.beat === 0 && round === "redflag" && !s.duel[key]) { // no contestants picked: choose a random pair
        const a = Math.floor(now / 7) % 8; const b = (a + 1 + (Math.floor(now / 3) % 7)) % 8;
        return { ...s, duel: { ...s.duel, [key]: { a, b } }, beat: 1, changedAt: now };
      }
      if (s.beat === 1) return { ...tally(s, round, key, ctx), beat: 2, changedAt: now };
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
    case "duel": {
      if (round !== "redflag") return s;
      const ok = (n: number) => Number.isInteger(n) && n >= 0 && n < 8;
      if (!ok(c.a) || (c.b !== -1 && (!ok(c.b) || c.b === c.a))) return s;
      return { ...s, duel: { ...s.duel, [key]: { a: c.a, b: c.b } }, changedAt: now };
    }
    case "pv": return { ...s, pv: c.on, changedAt: now };
    case "vote": {
      if (!round || (!s.pv && round !== "awards") || s.beat !== 1) return s; // awards always use phone voting
      if (!validChoice(round, c.voter, c.choice)) return s;
      if (round === "receipts" && ctx.authors?.[s.card] === c.voter) return s; // can't vote on your own receipt
      const k = `${round}:${s.card}`;
      return { ...s, votes: { ...s.votes, [k]: { ...(s.votes[k] ?? {}), [String(c.voter)]: c.choice } }, changedAt: now };
    }
    case "submit": {
      if (!Number.isInteger(c.voter) || c.voter < 0 || c.voter >= VOTERS) return s;
      const t = String(c.t ?? "").trim().slice(0, 140), f = String(c.f ?? "").trim().slice(0, 140);
      if (!t || !f || s.step >= gameStep("receipts")) return s; // locked once the game starts
      const flip = !!c.flip;
      return { ...s, subs: { ...s.subs, [String(c.voter)]: flip ? { a: f, b: t, fake: "A" } : { a: t, b: f, fake: "B" } }, changedAt: now };
    }
    case "hotStart": return { ...s, hot: { on: true, who: c.who, q: c.q, key: s.hot.key + 1 }, changedAt: now };
    case "hotEnd": return { ...s, hot: { ...s.hot, on: false }, changedAt: now };
    case "finale": return s.step === STEP.finale ? { ...s, finale: c.stage, changedAt: now } : s;
  }
}

/** Voters are islanders 0..7 plus the host (8). */
export const VOTERS = 9;
export function validChoice(round: RoundId, voter: number, choice: string | number): boolean {
  if (!Number.isInteger(voter) || voter < 0 || voter >= VOTERS) return false;
  if (round === "receipts") return choice === "A" || choice === "B";
  if (round === "awards") return Number.isInteger(choice) && (choice as number) >= 0 && (choice as number) < VOTERS && choice !== voter;
  if (round === "canceled") return Number.isInteger(choice) && (choice as number) >= 0 && (choice as number) < 8 && choice !== voter;
  if (round === "redflag") return false; // the challenge round is judged by the host, no phone votes
  return choice === "yes" || choice === "no";
}

/** When voting closes, turn the votes into the same results the host would have tapped. */
/** Mark the current receipt card as revealed so clients may now see which statement was fake. */
function markRevealed(s: PresState, ctx: Ctx): PresState {
  const a = ctx.authors?.[s.card]; return a === undefined || s.rev.includes(a) ? s : { ...s, rev: [...s.rev, a] };
}

function tally(s: PresState, round: RoundId, key: string, ctx: Ctx): PresState {
  if (round === "receipts") return markRevealed(s, ctx);
  if (round === "awards") return s;
  const v = s.votes[`${round}:${s.card}`]; if (!s.pv || !v || !Object.keys(v).length) return s;
  if (round === "canceled") {
    const t: Record<number, number> = {}; Object.values(v).forEach((x) => { t[x as number] = (t[x as number] ?? 0) + 1; });
    const max = Math.max(...Object.values(t)); const top = Object.keys(t).filter((k) => t[+k] === max).map(Number);
    return { ...s, res: { ...s.res, [round]: { ...s.res[round], [key]: top } } };
  }
  if (round === "exposed") {
    const yes = Object.entries(v).filter(([voter, x]) => x === "yes" && +voter < 8).map(([voter]) => +voter);
    return { ...s, res: { ...s.res, exposed: { ...s.res.exposed, [key]: yes } } };
  }
  return s;
}
