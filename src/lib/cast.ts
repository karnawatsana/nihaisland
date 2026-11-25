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


/** The real party cast: alphabetical, birthday girl (Niha) always last. Photos are uploaded in /setup. */
export function partyCast(): Islander[] {
  const rows: Omit<Islander, "id" | "accent" | "photo">[] = [
    { firstName: "Anvu", nickname: "The Lost Little Muse", bio: "Scorpio, artist, and the baby of the group. Can paint a masterpiece but not find the bathroom in a rental. Everyone has adopted the baby; nobody knows where the baby currently is.", stats: stats([70, 75, 85, 35]), quote: "I'm not lost, I'm exploring. With no map. And a lot of feelings." },
    { firstName: "Malu", nickname: "Little Sis, Big Bite", bio: "A Virgo who is somehow both the chillest and the most savage person here. Fun little-sister energy until you say something dumb, then it's a roast with a smile.", stats: stats([55, 30, 88, 78]), quote: "I'm super relaxed. Anyway, here's why you're wrong." },
    { firstName: "Riya", nickname: "The Brainy Baby Sis", bio: "Smart enough to win every argument, sweet enough to apologize for it. Will check that you've eaten, hydrated, and slept, then quietly out-think you at game night.", stats: stats([40, 25, 95, 80]), quote: "I'm not competitive. I just like winning. Also, did you drink water?" },
    { firstName: "Salena", nickname: "CEO of the Villa", bio: "Born December 17th: a Sagittarius, a boss woman, and an athlete. Treats every group activity like a championship and every group chat like a board meeting.", stats: stats([60, 45, 90, 85]), quote: "I don't do drama. I do cardio. And then I win." },
    { firstName: "Sana", nickname: "The Receipts Keeper", bio: "Virgo with an organized everything and a memory that never forgets: your birthday, your coffee order, and exactly what you said in 2019. Sensitive, maternal, and will absolutely bring snacks.", stats: stats([45, 20, 95, 75]), quote: "I'm not holding a grudge. I just remember everything. Vividly." },
    { firstName: "Sankhe", nickname: "Professor Actually", bio: "Aquarius, engineer, and holder of a PhD. Will explain why your idea won't work, with a diagram. Most likely to correct the trivia host and, annoyingly, be right every time.", stats: stats([25, 40, 80, 90]), quote: "Well, actually…" },
    { firstName: "Shaun", nickname: "The Undecided Bull", bio: "Libra finance bro with an athlete's body and a toddler's ability to pick a restaurant. Can manage your portfolio but not a menu. Still deciding how to end this bio.", stats: stats([50, 60, 75, 55]), quote: "Whatever you guys want. Actually, no. Actually… whatever you want." },
    { firstName: "Niha", nickname: "The Birthday Queen", bio: "Birthday queen, mom of the group, and somehow also the coolest person in the villa. Chill, badass, and savage: she'll hand you a snack and a roast in the same breath. Tonight she's the main event.", stats: stats([70, 35, 95, 90]), quote: "Relax, it's my birthday. Roast me. I dare you.", birthday: true },
  ];
  return rows.map((r, i) => ({ ...r, id: `s${i + 1}`, accent: ACCENTS[i], photo: null }));
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

export const partyHost = (): Islander => ({
  id: "host", firstName: "Abi", nickname: "Dr. Chaos", accent: "#ffb02e", photo: null,
  bio: "Aries, doctor, class clown, and the group's chaos coordinator. Has a wild story for every situation and a medical degree for the consequences. Tonight's host: trust the doctor, not the plan.",
  stats: stats([98, 70, 85, 55]), quote: "Trust me, I'm a doctor. (Please don't ask about the story.)",
});
export const demoHost = (): Islander => ({
  id: "host", firstName: "Dex", nickname: "Your Fictional Host", accent: "#ffb02e", photo: null,
  bio: "Demo-only host with a clipboard, a microphone and zero crowd control. Promises the show starts 'in five minutes' since 2019.",
  stats: stats([85, 80, 70, 40]), quote: "Welcome to the villa! Please ignore the smoke.",
});
export const defaultPoster = (host?: Islander): PosterConfig => ({ portrait: null, x: 0, y: 0, scale: 1, flip: false, host });
