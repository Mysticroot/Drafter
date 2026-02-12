// src/components/GameBoard.tsx
import React, { useState } from "react";
import { GameRoom, Card as CardType, Role } from "../types/game";
import { ALL_CARDS } from "../constants/cards";
import { DraftCard } from "./DraftCard";
import { PlayerPanel } from "./PlayerPanel";

interface GameBoardProps {
  room: GameRoom;
  playerId: string;
  onDrawCard: () => void;
  onAssignCard: (role: string) => void;
  onSkipCard: () => void;
  onSwapCards: (role1: string, role2: string) => void;
  onSkipSwap: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  room,
  playerId,
  onDrawCard,
  onAssignCard,
  onSkipCard,
  onSwapCards,
  onSkipSwap,
}) => {
  const [selectedRole1, setSelectedRole1] = useState<Role | null>(null);
  const [selectedRole2, setSelectedRole2] = useState<Role | null>(null);

  const currentPlayerIndex = room.currentPlayerIndex;
  const isCurrentPlayer =
    room.phase === "draft"
      ? room.players[currentPlayerIndex]?.id === playerId
      : false;
  const currentPlayer = room.players[currentPlayerIndex];
  const hasCardDrawn = room.currentCard !== null;

  const player = room.players.find((p) => p.id === playerId);
  const canSwap =
    room.phase === "swap" && player && !player.skipUsed && !player.swapUsed;

  const canAssign = isCurrentPlayer && hasCardDrawn;
  const canSkip = isCurrentPlayer && hasCardDrawn && !currentPlayer.skipUsed;
  const canDraw = isCurrentPlayer && !hasCardDrawn && room.deck.length > 0;

  const handleSwap = () => {
    if (selectedRole1 && selectedRole2) {
      onSwapCards(selectedRole1, selectedRole2);
      setSelectedRole1(null);
      setSelectedRole2(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Anime Draft Arena</h1>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Room ID</p>
            <p className="font-mono text-yellow-400 font-bold">
              {room.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs mb-1">DECK REMAINING</p>
            <p className="text-2xl font-bold">{room.deck.length} cards</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">CURRENT PHASE</p>
            <p
              className={`text-xl font-bold ${
                room.phase === "draft"
                  ? "text-blue-400"
                  : room.phase === "swap"
                    ? "text-purple-400"
                    : "text-green-400"
              }`}
            >
              {room.phase === "draft"
                ? "DRAFT"
                : room.phase === "swap"
                  ? "SWAP"
                  : "FINISHED"}
            </p>
          </div>
          {room.phase === "draft" && (
            <div className="text-right">
              <p className="text-slate-400 text-xs mb-1">CURRENT TURN</p>
              <p className="text-xl font-bold">
                {currentPlayer?.name || "Unknown"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {room.phase === "draft" || room.phase === "swap" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Draft Card or Swap Controls */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {room.phase === "draft" ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Draft Card</h2>
                  <DraftCard
                    card={room.currentCard}
                    isLoading={!hasCardDrawn && isCurrentPlayer}
                  />

                  {/* Controls */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={onDrawCard}
                      disabled={!canDraw}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {hasCardDrawn ? "✓ Card Drawn" : "Draw Card"}
                    </button>

                    {hasCardDrawn && (
                      <>
                        <p className="text-center text-slate-400 text-sm">
                          Assign to a slot or skip to draw again
                        </p>
                        <button
                          onClick={onSkipCard}
                          disabled={!canSkip}
                          className="w-full py-2 border-2 border-orange-400 text-orange-400 font-bold rounded-lg hover:bg-orange-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Skip Card (get another)
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4 text-purple-400">
                    Swap Phase
                  </h2>
                  <p className="text-slate-300 mb-6 text-sm">
                    {player?.skipUsed
                      ? "✗ You used skip - no swapping available"
                      : "Select 2 roles to swap their cards"}
                  </p>

                  {canSwap && (
                    <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                      <p className="text-xs font-semibold text-center mb-3">
                        Select 2 roles to swap
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Left: Select Role 1 */}
                        <div>
                          <p className="text-xs text-slate-400 mb-2 text-center">
                            Role 1
                          </p>
                          <div className="space-y-1">
                            {player?.team.map((slot) => (
                              <button
                                key={`role1-${slot.role}`}
                                onClick={() => setSelectedRole1(slot.role)}
                                disabled={!slot.cardId}
                                className={`w-full py-2 px-2 rounded text-xs font-semibold transition-all ${
                                  selectedRole1 === slot.role
                                    ? "bg-green-500 text-white ring-2 ring-green-300"
                                    : slot.cardId
                                      ? "bg-slate-600 hover:bg-slate-500 text-white"
                                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                }`}
                              >
                                {slot.role}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right: Select Role 2 */}
                        <div>
                          <p className="text-xs text-slate-400 mb-2 text-center">
                            Role 2
                          </p>
                          <div className="space-y-1">
                            {player?.team.map((slot) => (
                              <button
                                key={`role2-${slot.role}`}
                                onClick={() => setSelectedRole2(slot.role)}
                                disabled={
                                  !slot.cardId || slot.role === selectedRole1
                                }
                                className={`w-full py-2 px-2 rounded text-xs font-semibold transition-all ${
                                  selectedRole2 === slot.role
                                    ? "bg-green-500 text-white ring-2 ring-green-300"
                                    : slot.cardId && slot.role !== selectedRole1
                                      ? "bg-slate-600 hover:bg-slate-500 text-white"
                                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                }`}
                              >
                                {slot.role}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSwap}
                          disabled={!selectedRole1 || !selectedRole2}
                          className="flex-1 py-2 bg-green-500 text-white text-sm font-bold rounded hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Swap
                        </button>
                        <button
                          onClick={onSkipSwap}
                          className="flex-1 py-2 border border-slate-500 text-slate-300 text-sm font-bold rounded hover:bg-slate-700 transition-all"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}

                  {!canSwap && (
                    <div className="bg-slate-700 rounded-lg p-3 text-center text-slate-300 text-sm">
                      {player?.skipUsed
                        ? "You used skip - waiting for opponent..."
                        : "⏳ Waiting..."}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Player Panels */}
          <div className="lg:col-span-2 space-y-6">
            {room.players.map((p) => {
              const isPlayer = p.id === playerId;
              const playerCanAssign =
                isPlayer && canAssign && room.phase === "draft";
              return (
                <PlayerPanel
                  key={p.id}
                  player={p}
                  allCards={ALL_CARDS}
                  isCurrentPlayer={isPlayer && room.phase === "draft"}
                  canAssign={playerCanAssign}
                  onAssign={onAssignCard}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over Screen */
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-xl border-2 border-green-400 p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-6">Game Over!</h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {room.players.map((player) => {
                const score = room.scores?.[player.id] ?? 0;
                const isWinner = room.winnerId === player.id;
                return (
                  <div
                    key={player.id}
                    className={`p-6 rounded-lg border-2 ${
                      isWinner
                        ? "bg-yellow-500/20 border-yellow-400"
                        : "bg-slate-700 border-slate-600"
                    }`}
                  >
                    {isWinner && <div className="text-3xl mb-2">⭐</div>}
                    <h3 className="text-xl font-bold mb-2">{player.name}</h3>
                    <p className="text-slate-400 text-sm mb-2">Final Score</p>
                    <p
                      className={`text-4xl font-bold ${isWinner ? "text-yellow-400" : "text-slate-300"}`}
                    >
                      {score}
                    </p>
                  </div>
                );
              })}
            </div>

            {room.winnerId === undefined && (
              <p className="text-xl mb-6 text-slate-300">It's a tie!</p>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
