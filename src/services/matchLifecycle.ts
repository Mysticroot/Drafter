// src/services/matchLifecycle.ts
/**
 * Match lifecycle helpers - manages initialization and cleanup of game matches
 */
import { GameRoom } from "../game/types";
import { getRoom } from "../game/roomManager";

export function isMatchReady(room: GameRoom): boolean {
  return room.players.length === 2 && room.phase === "draft";
}

export function getActivePlayer(room: GameRoom) {
  return room.players[room.currentPlayerIndex];
}

export function getRoomSummary(room: GameRoom) {
  return {
    id: room.id,
    playerCount: room.players.length,
    phase: room.phase,
    currentTurn: room.currentPlayerIndex,
    deckRemaining: room.deck.length,
    currentCard: room.currentCard
      ? {
          id: room.currentCard.id,
          name: room.currentCard.name,
          anime: room.currentCard.anime,
          stats: room.currentCard.stats,
        }
      : null,
  };
}

export function getPlayerTeamSummary(playerId: string, room: GameRoom) {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  return {
    playerId: player.id,
    name: player.name,
    team: player.team,
    skipUsed: player.skipUsed,
    score: room.scores?.[player.id] ?? null,
  };
}
