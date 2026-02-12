// src/App.tsx
import React from "react";
import { SocketProvider, useSocket } from "./context/SocketContext";
import { RoomLobby } from "./components/RoomLobby";
import { GameBoard } from "./components/GameBoard";

const AppContent: React.FC = () => {
  const {
    room,
    playerId,
    drawCard,
    assignCard,
    skipCard,
    swapCards,
    skipSwap,
  } = useSocket();

  // Show lobby if no room, or if room exists but doesn't have 2 players yet
  if (!room || !playerId || room.players.length < 2) {
    return <RoomLobby />;
  }

  const handleDrawCard = () => {
    drawCard(room.id);
  };

  const handleAssignCard = (role: string) => {
    assignCard(room.id, role);
  };

  const handleSkipCard = () => {
    skipCard(room.id);
  };

  const handleSwapCards = (role1: string, role2: string) => {
    swapCards(room.id, role1, role2);
  };

  const handleSkipSwap = () => {
    skipSwap(room.id);
  };

  return (
    <GameBoard
      room={room}
      playerId={playerId}
      onDrawCard={handleDrawCard}
      onAssignCard={handleAssignCard}
      onSkipCard={handleSkipCard}
      onSwapCards={handleSwapCards}
      onSkipSwap={handleSkipSwap}
    />
  );
};

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
