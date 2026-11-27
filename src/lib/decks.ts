import type { Decks, GameKey } from "./types";

/** Starter content: generic, silly and safe. Edit everything in /setup → Games (add real receipts there!). */
/** Spicy, unusual starter cards (no real names, so also safe for the demo). Edit everything in /setup → Games. */
export const defaultDecks = (): Decks => ({
  receipts: [],
  canceled: [
    "bringing up \"the incident\" at every single dinner",
    "ghosting the group chat for a month, then returning with a meme like nothing happened",
    "sending a 9-minute voice note when a text would have worked",
    "\"borrowing\" a hoodie in 2020 and now insisting it was always theirs",
    "starting a group chat just to complain about the other group chat",
    "taking credit for a trip they did not plan",
    "telling a story with the wrong ending and refusing to be corrected",
    "reviewing a restaurant 1 star because \"the bathroom had bad energy\"",
    "screenshotting the group chat \"for evidence\"",
    "saying \"no offense, but…\" and then absolutely offending",
    "faking a phone call to escape a conversation, and then actually answering it",
    "being the reason an Uber driver gave us 2 stars",
    "knowing everyone's secrets and holding them hostage for snacks",
    "describing a toxic ex as \"just a little misunderstood\"",
  ],
  redflag: [
    "Says \"be honest with me\" and then goes silent for 3 days after you are",
    "Takes a 40-minute shower and calls it \"a quick rinse\"",
    "Replies \"lol\" to a paragraph about your feelings",
    "Keeps a mental scoreboard of who paid for what in 2021",
    "Has a strong opinion on everyone's ex. Unprompted. Always.",
    "Opens every message with \"don't be mad but…\"",
    "Orders for the whole table \"to be efficient\"",
    "Types, deletes and retypes a text for 20 minutes, then sends \"haha ok\"",
    "Says \"I'm two minutes away\" while still choosing an outfit",
    "Narrates the movie out loud to people who have already seen it",
    "Brings a surprise plus-one to a hangout. Every time.",
    "Likes your photo from 6 years ago at 2 AM, then pretends it was a glitch",
  ],
  exposed: [
    "sent a risky text and immediately turned my phone off",
    "googled myself, more than once",
    "said \"I love you\" first and regretted it by morning",
    "had a crush on a friend's ex and told no one",
    "cried in a bathroom at a party",
    "drunk-texted the wrong group chat",
    "pretended to be on a call to avoid someone I know",
    "stalked an ex's new partner down to their sister's wedding photos",
    "liked an old photo while stalking, in public, with my own account",
    "told a secret I swore I'd take to the grave (to only one person, I swear)",
    "ghosted someone, then replied \"omg sorry just saw this!!\" a month later",
    "rated my friends' partners privately, on a scale",
    "faked a laugh at a joke I did not understand, for an entire conversation",
    "gone back to read my own old texts and been cringed out by past me",
  ],
  awards: [
    "Most Likely to Start a Cult by Accident 🕯️",
    "Best Worst-Advice Giver 🤡",
    "Most Dangerous With a Group Chat Screenshot 📸",
    "The Friend Who Would Win an Argument With Just Facial Expressions 😒",
    "Most Likely to Befriend a Stranger Who Is Now Basically Family 🫂",
    "Group's Unofficial Therapist (No License, All Opinions) 🛋️",
    "Biggest Glow-Up Since We Met ✨",
    "Best Co-Pilot for Bad Decisions 🚗",
    "Most Likely to Fake Their Own Death to Avoid Hosting ⚰️",
    "Main Character Energy, Zero Apologies 🎬",
  ],
  hotseat: [
    "What's the most unhinged thing you've done for a crush?",
    "Which person in this room would you trust with a secret… and which one would absolutely tell?",
    "What's a lie you told that's still going?",
    "Who here has the worst taste in partners? Name the pattern.",
    "What's something you've said \"I'm fine\" about that you were not fine about?",
    "Describe the person on your left in three brutally honest words.",
    "What's the pettiest thing you've ever done, and would you do it again?",
    "What's your most embarrassing 'sent to the wrong person' story?",
    "If this friend group were a reality show, what's your villain edit?",
    "Which friend would you swap lives with for a week, and what would you change?",
    "What's the worst date you've ever been on? Details, please.",
    "What's a hill you will die on that everyone here thinks is wrong?",
  ],
});

/** Real party deck: the unusual cards above plus jokes built only from the traits you told me about each person. */
export const partyDecks = (): Decks => {
  const d = defaultDecks();
  return {
    ...d,
    canceled: [
      ...d.canceled,
      "diagnosing a stranger's rash at dinner with total confidence (a certain doctor)",
      "remembering exactly what you said in 2019, word for word, and quoting it back",
      "spending 45 minutes choosing between two identical restaurants",
      "correcting the waiter's pronunciation of a dish, with a source",
      "being physically at the party but spiritually somewhere in the clouds",
      "roasting someone so gently they thank you for it",
    ],
    redflag: [
      ...d.redflag,
      "Remembers every promise you ever made, with dates",
      "Has a PhD and uses it in every argument about where to eat",
      "Cannot choose a restaurant, a movie, or a seat",
      "Is in their own world and misses three topics of conversation",
      "Has a wild story for every occasion, none of them verifiable",
    ],
    exposed: [
      ...d.exposed,
      "pretended to understand a finance-bro explanation of crypto",
      "let someone else decide because I truly could not choose",
      "zoned out mid-conversation and answered \"yeah totally\" to a question",
      "told a wildly exaggerated story and watched it become group canon",
    ],
    hotseat: [
      ...d.hotseat,
      "Whose group-chat reply speed disrespects you the most?",
      "Who here gives the best advice and follows it the least?",
    ],
  };
};

export const GAME_META = {
  receipts: { icon: "🧾", title: "The Villa Has Receipts", hue: "#19c3dc", word: "POINT!", labels: ["Start 3-2-1", "Reveal the fake", "Next person"] },
  canceled: { icon: "🚫", title: "Most Likely to Get Canceled", hue: "#ff2d95", word: "POINT!", labels: ["Start 3-2-1", "Announce verdict", "Next card"] },
  redflag: { icon: "🚩", title: "Red Flag or Just a Personality?", hue: "#ff5a3c", word: "VOTE!", labels: ["Start vote", "Show verdict", "Next card"] },
  exposed: { icon: "🤫", title: "Never Have I Ever: Exposed", hue: "#ffb02e", word: "FINGERS DOWN!", labels: ["Fingers down!", "Show the damage", "Next card"] },
  awards: { icon: "🏆", title: "The Villa Awards", hue: "#ffc43d", word: "VOTE!", labels: ["Open voting", "Announce the winner", "Next award"] },
} as const;

/** Text for each round's intro screen: what it is and how to play. `pv` = phone voting is on. */
export const GAME_INTRO: Record<GameKey, { tagline: string; what: string; how: (pv: boolean) => string[] }> = {
  receipts: {
    tagline: "One true. One fake. Spot the liar.",
    what: "Everyone secretly sends in one TRUE and one FAKE statement about themselves. We show each person's two receipts, and the villa votes on which one is fake.",
    how: (pv) => [
      "Scan the QR code, pick who you are, and send one TRUE and one FAKE statement about yourself.",
      "We reveal each person's two receipts, A and B, in random order.",
      pv ? "Vote on your phone: which one is FAKE?" : "Everyone points or shouts: which one is FAKE?",
      "The fake gets stamped. Fool the room, or catch the liars. Best of both gets an award!",
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
  awards: {
    tagline: "Friends vote. Friends regret.",
    what: "The ceremony! For each award, everyone votes live on their phone for the friend who deserves it most. The winner gets crowned. Acceptance speeches are mandatory.",
    how: () => [
      "Scan the QR code on the TV and pick who you are.",
      "An award category appears on the screen.",
      "Vote on your phone for who deserves it most. No voting for yourself. Nice try.",
      "The winner is announced with confetti. Speech required!",
    ],
  },
};
