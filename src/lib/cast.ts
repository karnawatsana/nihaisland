import type { Islander, PosterConfig } from "./types";
import { STAT_LABELS } from "./types";

const ACCENTS = ["#ff2d95", "#19c3dc", "#ffb02e", "#9b5cff", "#2ee6a6", "#ff5a3c", "#4d8bff", "#ff2d95"];

const stats = (v: number[]) => STAT_LABELS.map((label, i) => ({ label, value: v[i] ?? 50 }));

/** Real party defaults: nothing is invented — every field is a clearly labelled placeholder. */
export function placeholderCast(): Islander[] {
  return Array.from({ length: 8 }, (_, i) => {
    const last = i === 7;
    return {
      id: `p${i + 1}`,
      firstName: last ? "Niharika" : `[ISLANDER ${i + 1}]`,
      nickname: "[ADD NICKNAME]",
      bio: "[Add a short, sarcastic bio in /setup → Cast]",
      stats: stats([50, 50, 50, 50]),
      quote: "[Add a one-line quote]",
      photo: null,
      accent: ACCENTS[i],
      birthday: last,
    };
  });
}

/** Demo mode: entirely fictional people & jokes. Never real friends, never real confessions. */
export function demoCast(): Islander[] {
  const base: Omit<Islander, "id" | "accent" | "photo">[] = [
    { firstName: "Sloane", nickname: "The Plot Twist", bio: "Arrived with a suitcase of secrets and a ring light she insists is 'just for the vibe'. Has never once been on time to her own drama.", stats: stats([92, 71, 38, 24]), quote: "I'm not messy, I'm just very well-informed." },
    { firstName: "Dante", nickname: "Captain Crop Top", bio: "Gym selfie archivist and self-appointed villa chef. Cooked once. Still mentions it daily.", stats: stats([55, 88, 67, 42]), quote: "Abs are temporary, but my confidence is a lease." },
    { firstName: "Mika", nickname: "Main Character Syndrome", bio: "Narrates her own entrances. Believes every group chat is a documentary about her.", stats: stats([78, 95, 52, 18]), quote: "Sorry, I thought the spotlight was left on for me." },
    { firstName: "Rowan", nickname: "Lowkey Loyal", bio: "Says 'I'm staying out of it' and then provides full subtitles. Snack thief of the highest order.", stats: stats([40, 33, 96, 81]), quote: "I never gossip. I just… share observations. Loudly." },
    { firstName: "Zuri", nickname: "Chaos in Sandals", bio: "Packed three outfits for a two-day trip. Brought zero chargers. Has a story for everything, mostly unverified.", stats: stats([97, 64, 49, 35]), quote: "Plans are just suggestions with extra steps." },
    { firstName: "Theo", nickname: "The Overthinker", bio: "Has drafted and deleted 400 texts this week. Will rate the villa's wifi out loud, twice.", stats: stats([46, 59, 84, 93]), quote: "I'm fine. (Please ask me again in an hour.)" },
    { firstName: "Luca", nickname: "Hot Take Hector", bio: "Defends pineapple on pizza, cilantro, and his questionable sunglasses with equal passion.", stats: stats([83, 76, 58, 47]), quote: "Controversial opinions keep me hydrated." },
    { firstName: "Birdie", nickname: "The Birthday Bombshell", bio: "Fashionably late to everything except her own party. Arrives in a cloud of glitter and plausible deniability.", stats: stats([88, 69, 91, 77]), quote: "It's my birthday and I'll be iconic if I want to.", birthday: true },
  ];
  return base.map((b, i) => ({ ...b, id: `d${i + 1}`, accent: ACCENTS[i], photo: null }));
}

export const defaultPoster = (): PosterConfig => ({ portrait: null, x: 0, y: 0, scale: 1, flip: false });
