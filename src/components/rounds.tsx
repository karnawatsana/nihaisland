"use client";
import type { RoomData } from "@/lib/useRoom";
import type { RoundId } from "@/lib/sequence";
import { AwardsRound, ChallengeRound, GameScreen } from "./games";

/** Each round is a card deck driven by the host's phone (see games.tsx). */
export function RoundScreen({ id, data }: { id: RoundId; data: RoomData }) {
  if (id === "awards") return <AwardsRound data={data} />;
  if (id === "redflag") return <ChallengeRound data={data} />;
  return <GameScreen id={id} data={data} />;
}
