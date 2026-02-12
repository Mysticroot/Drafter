// src/types/game.ts

export type Anime = "one_piece" | "naruto" | "bleach";

export type Role = "captain" | "viceCaptain" | "tank" | "healer" | "support";

export interface Card {
  id: string;
  name: string;
  anime: Anime;
  stats: Record<Role, number>;
}

export interface TeamSlot {
  role: Role;
  cardId: string | null;
}

export interface PlayerState {
  id: string;
  name: string;
  team: TeamSlot[];
  skipUsed: boolean;
}

export type GamePhase = "waiting" | "draft" | "finished";

export interface GameRoom {
  id: string;
  players: PlayerState[];
  deck: Card[];
  currentPlayerIndex: number;
  currentCard: Card | null;
  phase: GamePhase;
  winnerId?: string;
  scores?: Record<string, number>;
}
