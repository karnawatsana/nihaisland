"use client";
import type { RoomData } from "@/lib/useRoom";
import type { RoundId } from "@/lib/sequence";
import { GameScreen } from "./games";

/** Each round is a card deck driven by the host's phone (see games.tsx). */
export function RoundScreen({ id, data }: { id: RoundId; data: RoomData }) {
  return <GameScreen id={id} data={data} />;
}
