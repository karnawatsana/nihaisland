import type { Decks } from "./types";

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
