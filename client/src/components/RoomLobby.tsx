// src/components/RoomLobby.tsx
import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";

export const RoomLobby: React.FC = () => {
  const { createRoom, joinRoom, room, isConnected, error } = useSocket();
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createRoom(playerName);
      setPlayerName("");
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      joinRoom(roomId, playerName);
      setPlayerName("");
      setRoomId("");
    }
  };

  // Show room waiting screen if a room was created but 2nd player hasn't joined
  if (room && room.players.length === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-500 bg-clip-text text-transparent">
            Room Created! 🎉
          </h1>
          <p className="text-slate-400 text-center mb-6">
            Share this room ID with your opponent
          </p>

          <div className="bg-slate-700 rounded-lg p-6 mb-6 border-2 border-yellow-400">
            <p className="text-sm text-slate-400 mb-2">Room ID:</p>
            <p className="text-2xl font-mono font-bold text-yellow-400 text-center break-all">
              {room.id}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(room.id);
                alert("Room ID copied to clipboard!");
              }}
              className="w-full mt-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 text-yellow-300 rounded font-semibold transition-colors"
            >
              Copy ID
            </button>
          </div>

          <div className="bg-slate-700 p-4 rounded-lg mb-6">
            <p className="text-sm font-semibold mb-2">Your Info:</p>
            <p className="text-slate-300">
              <span className="text-slate-400">Name:</span>{" "}
              {room.players[0].name}
            </p>
            <p className="text-sm text-slate-400 mt-3">
              Waiting for opponent to join...
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded font-semibold transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 border border-slate-700">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-500 bg-clip-text text-transparent">
          Anime Draft Arena
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Strategic anime character drafting battle
        </p>

        {!isConnected && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6 text-red-200 text-sm">
            Connecting to server...
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded font-semibold transition-colors ${
              mode === "create"
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded font-semibold transition-colors ${
              mode === "join"
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Join Room
          </button>
        </div>

        {mode === "create" ? (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || !isConnected}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Create Room
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || !roomId.trim() || !isConnected}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Join Room
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-slate-700">
          <h3 className="text-lg font-semibold mb-3">How to Play</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>✓ Draw random characters from a deck</li>
            <li>✓ Assign to one of 5 team roles</li>
            <li>✓ Use skip once to discard a card</li>
            <li>✓ Win by highest role-specific stats</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
