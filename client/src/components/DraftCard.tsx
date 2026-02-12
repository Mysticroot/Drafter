// src/components/DraftCard.tsx
import React from "react";
import { Card, Anime } from "../types/game";

interface DraftCardProps {
  card: Card | null;
  isLoading?: boolean;
}

const animeColors: Record<Anime, { bg: string; border: string; text: string }> =
  {
    one_piece: {
      bg: "from-orange-600",
      border: "border-orange-400",
      text: "One Piece",
    },
    naruto: {
      bg: "from-yellow-600",
      border: "border-yellow-400",
      text: "Naruto",
    },
    bleach: {
      bg: "from-purple-600",
      border: "border-purple-400",
      text: "Bleach",
    },
  };

export const DraftCard: React.FC<DraftCardProps> = ({ card, isLoading }) => {
  if (!card) {
    return (
      <div className="h-96 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="animate-spin mb-4">⏳</div>
              <p className="text-slate-400">Drawing card...</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">🎴</div>
              <p className="text-slate-400">No card drawn</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const animeStyle = animeColors[card.anime];

  return (
    <div
      className={`h-96 bg-gradient-to-br ${animeStyle.bg} to-slate-900 rounded-xl border-2 ${animeStyle.border} p-6 flex flex-col justify-between shadow-2xl`}
    >
      <div>
        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3">
          {animeStyle.text}
        </div>
        <h2 className="text-2xl font-bold">{card.name}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Captain</p>
          <p className="text-2xl font-bold">{card.stats.captain}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Vice Captain</p>
          <p className="text-2xl font-bold">{card.stats.viceCaptain}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Tank</p>
          <p className="text-2xl font-bold">{card.stats.tank}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Healer</p>
          <p className="text-2xl font-bold">{card.stats.healer}</p>
        </div>
        <div className="col-span-2 bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Support</p>
          <p className="text-2xl font-bold">{card.stats.support}</p>
        </div>
      </div>

      <div className="text-xs text-white/50 text-center">{card.id}</div>
    </div>
  );
};
