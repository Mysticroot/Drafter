// src/game/roomManager.ts
import { randomUUID } from "crypto";
import { GameRoom, PlayerState, Role, TeamSlot } from "./types";
import { ALL_CARDS } from "./cards";

const rooms = new Map<string, GameRoom>();

function defaultTeam(): TeamSlot[] {
  return [
    { role: "captain", cardId: null },
    { role: "viceCaptain", cardId: null },
    { role: "tank", cardId: null },
    { role: "healer", cardId: null },
    { role: "support", cardId: null },
  ];
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function allTeamsFull(room: GameRoom): boolean {
  return room.players.every((p) =>
    p.team.every((slot) => slot.cardId !== null)
  );
}

function calculateScores(room: GameRoom): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const player of room.players) {
    let total = 0;
    for (const slot of player.team) {
      if (!slot.cardId) continue;
      const card = ALL_CARDS.find((c) => c.id === slot.cardId);
      if (!card) continue;
      total += card.stats[slot.role];
    }
    scores[player.id] = total;
  }

  return scores;
}

function drawNextCard(room: GameRoom): void {
  if (room.phase !== "draft") return;
  if (room.currentCard) return; // already have a card shown
  if (room.deck.length === 0) return;

  room.currentCard = room.deck.pop() || null;
}

// ---------- Public API ----------

export function createRoom(socketId: string, name: string): GameRoom {
  const player: PlayerState = {
    id: socketId,
    name,
    team: defaultTeam(),
    skipUsed: false,
  };

  const room: GameRoom = {
    id: randomUUID(),
    players: [player],
    deck: shuffle(ALL_CARDS),
    currentPlayerIndex: 0,
    currentCard: null,
    phase: "waiting",
  };

  rooms.set(room.id, room);
  return room;
}

export function joinRoom(
  roomId: string,
  socketId: string,
  name: string
): { room?: GameRoom; error?: string } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.players.length >= 2) return { error: "Room is full" };
  if (room.phase !== "waiting") return { error: "Game already started" };

  const player: PlayerState = {
    id: socketId,
    name,
    team: defaultTeam(),
    skipUsed: false,
  };

  room.players.push(player);
  // only move to draft; DO NOT draw here
  room.phase = "draft";
  room.currentCard = null;

  return { room };
}

export function requestDrawCard(
  roomId: string,
  socketId: string
): { room?: GameRoom; error?: string } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.phase !== "draft") return { error: "Draft not active" };

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (currentPlayer.id !== socketId) {
    return { error: "Not your turn" };
  }

  if (room.currentCard) {
    return { error: "Card already drawn; assign or skip first" };
  }

  if (room.deck.length === 0) {
    return { error: "No cards left in deck" };
  }

  drawNextCard(room);
  return { room };
}

export function handleAssignCard(
  roomId: string,
  socketId: string,
  slotRole: Role
): { room?: GameRoom; error?: string; gameFinished?: boolean } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.phase !== "draft") return { error: "Draft not active" };

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (currentPlayer.id !== socketId) {
    return { error: "Not your turn" };
  }

  if (!room.currentCard) {
    return { error: "No card drawn" };
  }

  const slot = currentPlayer.team.find((s) => s.role === slotRole);
  if (!slot) return { error: "Invalid slot" };
  if (slot.cardId) return { error: "Slot already filled" };

  // assign card
  slot.cardId = room.currentCard.id;
  room.currentCard = null;

  // check if draft finished
  if (allTeamsFull(room)) {
    room.phase = "finished";
    const scores = calculateScores(room);
    room.scores = scores;

    const [p1, p2] = room.players;
    const score1 = scores[p1.id] || 0;
    const score2 = scores[p2.id] || 0;

    if (score1 > score2) room.winnerId = p1.id;
    else if (score2 > score1) room.winnerId = p2.id;
    else room.winnerId = undefined; // tie

    return { room, gameFinished: true };
  }

  // switch turn; NEXT player will manually call draw_card
  room.currentPlayerIndex = 1 - room.currentPlayerIndex;

  return { room };
}

export function handleSkipCard(
  roomId: string,
  socketId: string
): { room?: GameRoom; error?: string; gameFinished?: boolean } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.phase !== "draft") return { error: "Draft not active" };

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (currentPlayer.id !== socketId) {
    return { error: "Not your turn" };
  }
  if (currentPlayer.skipUsed) {
    return { error: "Skip already used" };
  }
  if (!room.currentCard) {
    return { error: "No card drawn" };
  }

  currentPlayer.skipUsed = true;
  room.currentCard = null;

  if (allTeamsFull(room)) {
    room.phase = "finished";
    const scores = calculateScores(room);
    room.scores = scores;

    const [p1, p2] = room.players;
    const score1 = scores[p1.id] || 0;
    const score2 = scores[p2.id] || 0;

    if (score1 > score2) room.winnerId = p1.id;
    else if (score2 > score1) room.winnerId = p2.id;
    else room.winnerId = undefined;

    return { room, gameFinished: true };
  }

  room.currentPlayerIndex = 1 - room.currentPlayerIndex;

  return { room };
}

export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId);
}

export function removePlayer(socketId: string): void {
  for (const [roomId, room] of rooms.entries()) {
    const index = room.players.findIndex((p) => p.id === socketId);
    if (index !== -1) {
      room.players.splice(index, 1);

      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else {
        room.phase = "finished";
      }
    }
  }
}
