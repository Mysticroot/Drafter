// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { GameRoom } from "../types/game";

interface SocketContextType {
  socket: Socket | null;
  room: GameRoom | null;
  playerId: string | null;
  isConnected: boolean;
  error: string | null;
  createRoom: (name: string) => void;
  joinRoom: (roomId: string, name: string) => void;
  drawCard: (roomId: string) => void;
  assignCard: (roomId: string, role: string) => void;
  skipCard: (roomId: string) => void;
  swapCards: (roomId: string, role1: string, role2: string) => void;
  skipSwap: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setPlayerId(newSocket.id || null);
      setError(null);
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setError("Disconnected from server");
      console.log("Socket disconnected");
    });

    newSocket.on("room_created", (data: { room: GameRoom }) => {
      setRoom(data.room);
      setError(null);
    });

    newSocket.on("room_updated", (data: GameRoom) => {
      setRoom(data);
      setError(null);
    });

    newSocket.on(
      "game_over",
      (data: { roomId: string; scores: Record<string, number> }) => {
        if (room) {
          setRoom({ ...room, scores: data.scores, phase: "finished" });
        }
      },
    );

    newSocket.on("invalid_action", (data: { message: string }) => {
      setError(data.message);
    });

    newSocket.on("connect_error", (err) => {
      setError(`Connection error: ${err.message}`);
      console.error("Connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = (name: string) => {
    if (socket) {
      socket.emit("create_room", { name });
    }
  };

  const joinRoom = (roomId: string, name: string) => {
    if (socket) {
      socket.emit("join_room", { roomId, name });
    }
  };

  const drawCard = (roomId: string) => {
    if (socket) {
      socket.emit("draw_card", { roomId });
    }
  };

  const assignCard = (roomId: string, slotRole: string) => {
    if (socket) {
      socket.emit("assign_card", { roomId, slotRole });
    }
  };

  const skipCard = (roomId: string) => {
    if (socket) {
      socket.emit("skip_card", { roomId });
    }
  };

  const swapCards = (roomId: string, role1: string, role2: string) => {
    if (socket) {
      socket.emit("swap_cards", { roomId, role1, role2 });
    }
  };

  const skipSwap = (roomId: string) => {
    if (socket) {
      socket.emit("skip_swap", { roomId });
    }
  };

  const value: SocketContextType = {
    socket,
    room,
    playerId,
    isConnected,
    error,
    createRoom,
    joinRoom,
    drawCard,
    assignCard,
    skipCard,
    swapCards,
    skipSwap,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
