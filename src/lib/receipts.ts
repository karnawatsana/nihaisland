import type { PresState } from "./types";

/** What the clients see: statements in A/B order. `fake` is only present once that card has been revealed. */
export type Sub = { a: string; b: string; fake?: "A" | "B" };

/** Cards are the people who submitted, in a fixed order. */
export const authorsOf = (subs: Record<string, Sub>): number[] => Object.keys(subs).map(Number).sort((x, y) => x - y);

export interface ReceiptStats { fooled: Record<number, number>; caught: Record<number, number>; total: number }
/** Awards math over revealed cards only: how many people each author fooled, and how many fakes each voter caught. */
export function receiptStats(s: PresState): ReceiptStats {
  const subs = s.subs as Record<string, Sub>; const authors = authorsOf(subs);
  const out: ReceiptStats = { fooled: {}, caught: {}, total: 0 };
  authors.forEach((author, idx) => {
    const sub = subs[String(author)]; if (!sub?.fake) return;
    const votes = s.votes[`receipts:${idx}`] ?? {}; out.total++;
    Object.entries(votes).forEach(([voter, choice]) => {
      if (choice === sub.fake) out.caught[+voter] = (out.caught[+voter] ?? 0) + 1;
      else out.fooled[author] = (out.fooled[author] ?? 0) + 1;
    });
  });
  return out;
}
