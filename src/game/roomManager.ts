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
    p.team.every((slot) => slot.cardId !== null),
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
    draftingComplete: false,
    swapUsed: false,
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
  name: string,
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
    draftingComplete: false,
    swapUsed: false,
  };

  room.players.push(player);
  // only move to draft; DO NOT draw here
  room.phase = "draft";
  room.currentCard = null;

  return { room };
}

export function requestDrawCard(
  roomId: string,
  socketId: string,
): { room?: GameRoom; error?: string } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.phase !== "draft") return { error: "Draft not active" };

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (currentPlayer.id !== socketId) {
    return { error: "Not your turn" };
  }

  if (currentPlayer.draftingComplete) {
    return { error: "Your team is complete, waiting for opponent" };
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
  slotRole: Role,
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

  // check if this player's team is full
  const playerTeamFull = currentPlayer.team.every((s) => s.cardId !== null);
  if (playerTeamFull) {
    currentPlayer.draftingComplete = true;
  }

  // check if both teams are full
  const bothDone = room.players.every((p) => p.draftingComplete);
  if (bothDone) {
    // transition to swap phase if any player hasn't used skip
    const someCanSwap = room.players.some((p) => !p.skipUsed && !p.swapUsed);
    if (someCanSwap) {
      room.phase = "swap";
      return { room };
    }

    // otherwise finalize immediately
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

  // switch turn to other player (ALWAYS after assigning, unless game is finished)
  room.currentPlayerIndex = 1 - room.currentPlayerIndex;

  return { room };
}

export function handleSkipCard(
  roomId: string,
  socketId: string,
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

  // Mark skip as used, discard card
  currentPlayer.skipUsed = true;
  room.currentCard = null;

  // DO NOT switch turn - same player draws again
  // (turn only switches after assigning a card)

  // Check if both teams are full
  const bothDone = room.players.every((p) => p.draftingComplete);
  if (bothDone) {
    // transition to swap phase if any player hasn't used skip
    const someCanSwap = room.players.some((p) => !p.skipUsed && !p.swapUsed);
    if (someCanSwap) {
      room.phase = "swap";
      return { room };
    }

    // otherwise finalize immediately
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

  return { room };
}

export function handleSwap(
  roomId: string,
  socketId: string,
  role1: Role,
  role2: Role,
): { room?: GameRoom; error?: string; gameFinished?: boolean } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.phase !== "swap") return { error: "Not in swap phase" };

  const player = room.players.find((p) => p.id === socketId);
  if (!player) return { error: "Player not found" };

  // Can only swap if skip was NOT used
  if (player.skipUsed) {
    return { error: "Cannot swap because you used skip in draft" };
  }

  // Can only swap once
  if (player.swapUsed) {
    return { error: "Swap already used" };
  }

  if (role1 === role2) return { error: "Cannot swap same role" };

  const slot1 = player.team.find((s) => s.role === role1);
  const slot2 = player.team.find((s) => s.role === role2);

  if (!slot1 || !slot2) return { error: "Invalid roles" };
  if (!slot1.cardId || !slot2.cardId)
    return { error: "Both slots must be filled" };

  // swap the card IDs
  [slot1.cardId, slot2.cardId] = [slot2.cardId, slot1.cardId];
  player.swapUsed = true;

  // check if both players are done swapping (or can't swap)
  const bothSwappedOrCantSwap = room.players.every(
    (p) => p.swapUsed || p.skipUsed,
  );
  if (bothSwappedOrCantSwap) {
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

  return { room };
}

export function handleSkipSwap(
  roomId: string,
  socketId: string,
): { room?: GameRoom; error?: string; gameFinished?: boolean } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.phase !== "swap") return { error: "Not in swap phase" };

  const player = room.players.find((p) => p.id === socketId);
  if (!player) return { error: "Player not found" };
  if (player.swapUsed) return { error: "Already made swap decision" };

  // player chose to skip swap
  player.swapUsed = true;

  // check if both players are done swapping (or can't swap)
  const bothSwappedOrCantSwap = room.players.every(
    (p) => p.swapUsed || p.skipUsed,
  );
  if (bothSwappedOrCantSwap) {
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
