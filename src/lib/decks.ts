import type { Decks, GameKey } from "./types";

/** Starter content: generic, silly and safe. Edit everything in /setup → Games (add real receipts there!). */
/** Spicy, unusual starter cards (no real names, so also safe for the demo). Edit everything in /setup → Games. */
export const defaultDecks = (): Decks => ({
  receipts: [],
  canceled: [ // finish the sentence: "Most likely to…"
    "accidentally join a cult because the founder had good snacks",
    "text \"we need to talk\" and it's about where to eat",
    "know a stranger's whole life story before the Uber arrives",
    "survive a zombie apocalypse by talking the zombies out of it",
    "fake their own death to get out of hosting",
    "date a friend's ex and call it \"closure\"",
    "get kicked out of a wedding they were invited to",
    "like an ex's photo from 2016 at 3 AM, in public",
    "start a fight with a self-checkout machine",
    "sell out the whole group in the first five minutes of an interrogation",
    "marry someone they met this week",
    "cry at a Pixar movie, then blame allergies",
    "get lost in their own neighborhood",
    "become famous for something deeply embarrassing",
    "get ghosted by a pizza place",
    "secretly date someone for a year and tell no one",
    "adopt a pet at a bar",
    "win an argument with one sarcastic sentence",
    "send a voice note in the middle of a fight and make it worse",
    "rank their friends in a Notes app and accidentally screen-share it",
    "come back from a spiritual retreat 10x more annoying",
    "argue with a stranger on a plane and exchange numbers afterwards",
  ],
  redflag: [ // 5 Second Challenge prompts
    "Name 3 things you'd find in a terrible dating profile",
    "Name 3 lies everyone tells at a job interview",
    "Name 3 things you should NEVER say to airport security",
    "Do your most dramatic villain laugh",
    "Name 3 reasons someone would get kicked out of this friend group",
    "Pitch the worst startup idea you can think of. Name included.",
    "Name 3 things people pretend to understand (crypto counts)",
    "Do your best impression of the person on your left. They are the judge.",
    "Name 3 red flags that sound like green flags",
    "Say \"I'm fine\" in 3 completely different emotions",
    "Name 3 things you'd say to your ex at 2 AM and then regret",
    "Order a coffee in the most intense movie-trailer voice you can",
    "Name 3 excuses for being late that you have personally used",
    "Give a sincere 5-second apology to your phone for always being on 1%",
    "Scream like you just saw your own bank balance",
    "Name 3 snacks that would make you betray a friend",
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
      "diagnose you at brunch with total confidence and be wrong",
      "begin a story with \"okay so this one time…\" and lose the entire table",
      "spend 40 minutes choosing a restaurant, then order what they got last time",
      "quote what you said in 2019, word for word, mid-argument",
      "turn a casual hangout into a lecture with slides",
      "wander off mid-conversation to think about something in the clouds",
      "roast you savagely and then hand you a snack",
      "text you \"did you eat?\" and then have opinions about what you ate",
      "force the whole group to watch a three-hour movie",
    ],
    redflag: [
      ...d.redflag,
      "Name 3 things you'd pack for a trip, as someone who can't decide, in 5 seconds",
      "Tell a wildly believable story about how you met someone in this room",
      "Recite exactly what someone here said last Tuesday. Make it dramatic.",
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
  canceled: { icon: "👉", title: "Most Likely To…", hue: "#ff2d95", word: "POINT!", labels: ["Start 3-2-1", "Announce the culprit", "Next card"] },
  redflag: { icon: "⏱️", title: "5 Second Challenge", hue: "#ff5a3c", word: "GO!", labels: ["Start the clock", "Call the result", "Next challenge"] },
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
    tagline: "Point. Accuse. Regret.",
    what: "Each card finishes the sentence “Most likely to…”. Everyone picks the friend it fits best, and whoever gets the most votes is named and shamed.",
    how: (pv) => [
      "A “Most likely to…” card appears on the TV.",
      pv ? "Vote for who it fits best on your phone." : "On 3-2-1, everyone points at who it fits best.",
      "You can't pick yourself. Everyone else is fair game.",
      "The person with the most votes gets named. Ties get named together.",
    ],
  },
  redflag: {
    tagline: "Think fast. Look silly.",
    what: "Quick-fire chaos. A challenge appears, one or two people are called out, and they get exactly 5 seconds to nail it. Fail loudly or win proudly.",
    how: () => [
      "A challenge appears on the TV and the host calls out who's playing.",
      "One person solo, or two people head-to-head.",
      "5 seconds on the clock. Shout your answer. Don't think!",
      "The group judges. The winner gets a point, and the loser gets mocked.",
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
