import type { Decks, GameKey } from "./types";

/** Starter content: generic, silly and safe. Edit everything in /setup → Games (add real receipts there!). */
export const defaultDecks = (): Decks => ({
  receipts: [
    { q: "Who has the most unread messages right now?", reveal: "" },
    { q: "Who takes the longest to reply to a text?", reveal: "" },
    { q: "Who has said \"I'm five minutes away\" while still at home?", reveal: "" },
    { q: "Who is always the last one ready to leave?", reveal: "" },
    { q: "Who sends the longest voice notes?", reveal: "" },
    { q: "Who has the most screenshots in their camera roll?", reveal: "" },
    { q: "Who is most likely to explain why your idea won't work… with a diagram?", reveal: "" },
    { q: "Who would last the longest in the villa without their phone?", reveal: "" },
  ],
  canceled: [
    "replying \"k\" to a heartfelt paragraph",
    "correcting the trivia host. Out loud. Twice.",
    "saying \"I'm not hungry\" and then eating everyone's fries",
    "being \"five minutes away\" for an entire hour",
    "a hot take on pineapple pizza",
    "liking an ex's photo from 2017",
    "leaving the group chat dramatically (and rejoining an hour later)",
    "splitting the bill to the exact cent",
    "telling a story that's \"really not that long\"",
    "sleeping through their own surprise party",
  ],
  redflag: [
    "Reads the menu for 20 minutes, then says \"you pick\"",
    "Replies three days later with \"omg just saw this\"",
    "Has a calendar for hangouts. Colour-coded.",
    "Starts every correction with \"well, actually\"",
    "Always arrives exactly on time",
    "Has a wild story for every situation",
    "Leaves 40 tabs open. Always.",
    "Is asleep by 10pm at every party",
    "Says \"I'm chill\" while visibly not chill",
    "Never ever picks the restaurant",
  ],
  exposed: [
    "pretended to be asleep to avoid a conversation",
    "said \"on my way\" while still in bed",
    "read a text and forgot to answer for a week",
    "cried at a commercial",
    "laughed at a joke I didn't understand",
    "gotten lost with GPS on",
    "sent a text to the wrong person",
    "pretended to know the words at karaoke",
    "eaten food off the floor (5-second rule)",
    "stalked someone's Instagram back to 2014",
  ],
  hotseat: [
    "What's your most unpopular opinion?",
    "What's the pettiest thing you've ever done?",
    "What's a lie you told that is somehow still going?",
    "Describe this friend group's drama in three words.",
    "What's your worst texting habit?",
    "If you had to be canceled, what for?",
    "Who here would you trust with a secret… and who definitely not?",
    "What's the most embarrassing thing in your camera roll? (Describe it, don't show it.)",
  ],
});

export const GAME_META = {
  receipts: { icon: "🧾", title: "The Villa Has Receipts", hue: "#19c3dc", word: "POINT!", labels: ["Start 3-2-1", "Print the receipt", "Next card"] },
  canceled: { icon: "🚫", title: "Most Likely to Get Canceled", hue: "#ff2d95", word: "POINT!", labels: ["Start 3-2-1", "Announce verdict", "Next card"] },
  redflag: { icon: "🚩", title: "Red Flag or Just a Personality?", hue: "#ff5a3c", word: "VOTE!", labels: ["Start vote", "Show verdict", "Next card"] },
  exposed: { icon: "🤫", title: "Never Have I Ever: Exposed", hue: "#ffb02e", word: "FINGERS DOWN!", labels: ["Fingers down!", "Show the damage", "Next card"] },
} as const;

/** Text for each round's intro screen: what it is and how to play. `pv` = phone voting is on. */
export const GAME_INTRO: Record<GameKey, { tagline: string; what: string; how: (pv: boolean) => string[] }> = {
  receipts: {
    tagline: "The group has opinions. We brought receipts.",
    what: "A question about the group is printed on a receipt. Everyone decides who it describes best, and the most-picked person gets the receipt stamped. No hiding.",
    how: (pv) => [
      "A question appears on a receipt on the TV.",
      pv ? "When the host opens voting, pick who it fits best on your phone." : "When the host says go, everyone points at who it fits on 3-2-1.",
      "You can't pick yourself. Be honest. Be dramatic.",
      "The most-picked person gets the receipt. Defend yourself out loud!",
    ],
  },
  canceled: {
    tagline: "Vote. Regret. Repeat.",
    what: "Each card finishes the sentence “Most likely to get canceled for…”. You decide who in the villa is most likely, and the winner gets officially canceled.",
    how: (pv) => [
      "A “most likely to get canceled for…” card appears.",
      pv ? "Vote for who's most likely on your phone." : "On 3-2-1, everyone points at who's most likely.",
      "The person with the most votes is stamped CANCELED.",
      "Tied votes? Everyone tied gets canceled. Appeals are not accepted.",
    ],
  },
  redflag: {
    tagline: "Defend your choices.",
    what: "Each card describes a habit or quirk. Is it a genuine red flag, or just a personality? The villa votes and the majority decides.",
    how: (pv) => [
      "A habit or quirk appears on the TV.",
      pv ? "Vote 🚩 Red flag or ✅ Just a personality on your phone." : "Everyone calls it out loud: 🚩 red flag, or ✅ personality.",
      "The majority wins. A tie means a hung jury.",
      "Argue your case: someone here definitely does this.",
    ],
  },
  exposed: {
    tagline: "Fingers down. Truth up.",
    what: "A “Never have I ever…” statement appears. If you HAVE done it, you're exposed. The TV counts who put a finger down.",
    how: (pv) => [
      "A “Never have I ever…” card appears.",
      pv ? "Tap 👇 I have… if it's true for you, or ✋ Never if it's not." : "If you've done it, put a finger down. Everyone's watching.",
      "The TV shows who got exposed and keeps score all game.",
      "Lying is allowed. Getting caught is encouraged.",
    ],
  },
};
