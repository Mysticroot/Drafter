// src/components/PlayerPanel.tsx
import React from "react";
import { PlayerState, Card } from "../types/game";
import { TeamSlot } from "./TeamSlot";

interface PlayerPanelProps {
  player: PlayerState;
  allCards: Card[];
  isCurrentPlayer: boolean;
  canAssign: boolean;
  onAssign: (role: string) => void;
  score?: number;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  allCards,
  isCurrentPlayer,
  canAssign,
  onAssign,
  score,
}) => {
  const filledSlots = player.team.filter((s) => s.cardId !== null).length;
  const totalSlots = player.team.length;

  return (
    <div
      className={`bg-slate-800 rounded-xl p-6 border-2 ${isCurrentPlayer ? "border-yellow-400" : "border-slate-700"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{player.name}</h3>
          <p className="text-slate-400 text-sm">
            Team: {filledSlots}/{totalSlots} filled
          </p>
        </div>
        <div className="text-right">
          {score !== undefined && (
            <div>
              <p className="text-slate-400 text-xs">Score</p>
              <p className="text-2xl font-bold text-green-400">{score}</p>
            </div>
          )}
          {player.skipUsed && (
            <div className="text-yellow-400 text-xs font-semibold mt-2">
              ✓ Skip used
            </div>
          )}
        </div>
      </div>

      {isCurrentPlayer && (
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-2 mb-4 text-blue-200 text-xs font-semibold">
          Your turn!
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {player.team.map((slot) => (
          <TeamSlot
            key={slot.role}
            slot={slot}
            allCards={allCards}
            isCurrentPlayer={isCurrentPlayer}
            canAssign={canAssign}
            onAssign={onAssign}
          />
        ))}
      </div>
    </div>
  );
};
