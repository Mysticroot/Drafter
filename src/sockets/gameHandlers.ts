// src/sockets/gameHandlers.ts
import { Server, Socket } from "socket.io";
import {
  createRoom,
  joinRoom,
  handleAssignCard,
  handleSkipCard,
  handleSwap,
  handleSkipSwap,
  removePlayer,
  requestDrawCard,
} from "../game/roomManager";
import { Role } from "../game/types";

export function registerGameHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("welcome", "Connected to Anime Draft server");

    socket.on("create_room", ({ name }: { name: string }) => {
      const room = createRoom(socket.id, name || "Player");
      socket.join(room.id);
      socket.emit("room_created", { roomId: room.id, room });
    });

    socket.on(
      "join_room",
      ({ roomId, name }: { roomId: string; name: string }) => {
        const { room, error } = joinRoom(roomId, socket.id, name || "Player");
        if (error || !room) {
          socket.emit("invalid_action", { message: error });
          return;
        }
        socket.join(room.id);
        io.to(room.id).emit("room_updated", room);
      },
    );

    // NEW: draw card manually
    socket.on("draw_card", ({ roomId }: { roomId: string }) => {
      const { room, error } = requestDrawCard(roomId, socket.id);
      if (error || !room) {
        socket.emit("invalid_action", { message: error });
        return;
      }

      // you could emit a separate "card_drawn" event, but
      // for now we just send updated room
      io.to(room.id).emit("room_updated", room);
    });

    socket.on(
      "assign_card",
      ({ roomId, slotRole }: { roomId: string; slotRole: Role }) => {
        const { room, error, gameFinished } = handleAssignCard(
          roomId,
          socket.id,
          slotRole,
        );
        if (error || !room) {
          socket.emit("invalid_action", { message: error });
          return;
        }

        io.to(room.id).emit("room_updated", room);

        if (gameFinished && room.scores) {
          io.to(room.id).emit("game_over", {
            roomId: room.id,
            scores: room.scores,
            winnerId: room.winnerId ?? null,
          });
        }
      },
    );

    socket.on("skip_card", ({ roomId }: { roomId: string }) => {
      const { room, error, gameFinished } = handleSkipCard(roomId, socket.id);
      if (error || !room) {
        socket.emit("invalid_action", { message: error });
        return;
      }

      io.to(room.id).emit("room_updated", room);

      if (gameFinished && room.scores) {
        io.to(room.id).emit("game_over", {
          roomId: room.id,
          scores: room.scores,
          winnerId: room.winnerId ?? null,
        });
      }
    });

    socket.on(
      "swap_cards",
      ({
        roomId,
        role1,
        role2,
      }: {
        roomId: string;
        role1: Role;
        role2: Role;
      }) => {
        const { room, error, gameFinished } = handleSwap(
          roomId,
          socket.id,
          role1,
          role2,
        );
        if (error || !room) {
          socket.emit("invalid_action", { message: error });
          return;
        }

        io.to(room.id).emit("room_updated", room);

        if (gameFinished && room.scores) {
          io.to(room.id).emit("game_over", {
            roomId: room.id,
            scores: room.scores,
            winnerId: room.winnerId ?? null,
          });
        }
      },
    );

    socket.on("skip_swap", ({ roomId }: { roomId: string }) => {
      const { room, error, gameFinished } = handleSkipSwap(roomId, socket.id);
      if (error || !room) {
        socket.emit("invalid_action", { message: error });
        return;
      }

      io.to(room.id).emit("room_updated", room);

      if (gameFinished && room.scores) {
        io.to(room.id).emit("game_over", {
          roomId: room.id,
          scores: room.scores,
          winnerId: room.winnerId ?? null,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      removePlayer(socket.id);
    });
  });
}
