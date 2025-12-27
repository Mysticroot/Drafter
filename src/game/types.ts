// src/game/types.ts
export type Anime = "one_piece" | "naruto" | "bleach";

export type Role = "captain" | "viceCaptain" | "tank" | "healer" | "support";

export interface Card {
  id: string;
  name: string;
  anime: Anime;
  stats: Record<Role, number>; // e.g. { captain: 90, tank: 70, ... }
}

export interface TeamSlot {
  role: Role;
  cardId: string | null; // which card is in this slot
}

export interface PlayerState {
  id: string; // socket.id
  name: string;
  team: TeamSlot[];
  skipUsed: boolean; // true once player has used skip
}

export type GamePhase = "waiting" | "draft" | "finished";

export interface GameRoom {
  id: string;
  players: PlayerState[];
  deck: Card[];
  currentPlayerIndex: number; // 0 or 1
  currentCard: Card | null;
  phase: GamePhase;
  winnerId?: string;
  scores?: Record<string, number>;
}
