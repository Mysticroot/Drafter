// src/components/TeamSlot.tsx
import React from "react";
import { TeamSlot as TeamSlotType, Role, Card } from "../types/game";

interface TeamSlotProps {
  slot: TeamSlotType;
  allCards: Card[];
  isCurrentPlayer: boolean;
  canAssign: boolean;
  onAssign: (role: Role) => void;
}

const roleEmojis: Record<Role, string> = {
  captain: "👑",
  viceCaptain: "⚔️",
  tank: "🛡️",
  healer: "💚",
  support: "🤝",
};

const roleLabels: Record<Role, string> = {
  captain: "Captain",
  viceCaptain: "Vice Captain",
  tank: "Tank",
  healer: "Healer",
  support: "Support",
};

export const TeamSlot: React.FC<TeamSlotProps> = ({
  slot,
  allCards,
  isCurrentPlayer,
  canAssign,
  onAssign,
}) => {
  const card = allCards.find((c) => c.id === slot.cardId);
  const isFilled = slot.cardId !== null;

  return (
    <div
      onClick={() => {
        if (isCurrentPlayer && canAssign && !isFilled) {
          onAssign(slot.role);
        }
      }}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isFilled
          ? "bg-slate-700 border-green-400"
          : isCurrentPlayer && canAssign
            ? "bg-slate-700 border-dashed border-yellow-400 hover:border-yellow-200"
            : "bg-slate-800 border-slate-600"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{roleEmojis[slot.role]}</span>
        <span className="font-semibold text-sm">{roleLabels[slot.role]}</span>
      </div>

      {isFilled && card ? (
        <div>
          <p className="font-bold text-sm">{card.name}</p>
          <p className="text-xs text-slate-400 mb-2">
            {card.anime.replace("_", " ")}
          </p>
          <p className="text-lg font-bold text-yellow-400">
            {card.stats[slot.role]}
          </p>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          {isCurrentPlayer && canAssign ? "Click to assign" : "Empty"}
        </p>
      )}
    </div>
  );
};
