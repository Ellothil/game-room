/** biome-ignore-all lint/suspicious/noConsole: <console is ok> */

import type { Server as HttpServer } from "node:http";
import { join } from "node:path";
import dotenv from "dotenv";
import type {
  ClientToServerEvents,
  GameRoom,
  Player,
  ServerToClientEvents,
} from "shared/websocket/types";
import { Server } from "socket.io";

dotenv.config({
  override: true,
  path: join(__dirname, "../../../client/.env"),
});

const rooms: GameRoom[] = [
  {
    id: "tic-tac-toe-1",
    name: "Tic Tac Toe",
    players: [],
    maxPlayers: 2,
    gameType: "tic-tac-toe",
  },
];

// Track socket to user mapping for disconnect handling
const socketToUserMap = new Map<string, { id: string; username: string }>();

export function initSocketServer(server: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: `${process.env.VITE_CLIENT_URL}:${process.env.VITE_CLIENT_PORT}`,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡️ User connected: ${socket.id}`);

    socket.on("room:list", () => {
      socket.emit("room:list", rooms);
    });

    socket.on("room:join", (roomId, user) => {
      socketToUserMap.set(socket.id, user);

      const existingRoom = rooms.find((r) =>
        r.players.some((p) => p.id === user.id)
      );
      if (existingRoom) {
        const message =
          existingRoom.id === roomId
            ? "You are already in this room."
            : "You are already in another room. Leave first to join a new one.";
        socket.emit("room:join:error", { message });
        return;
      }

      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit("room:join:error", { message: "Room is full." });
        return;
      }

      const player: Player = { ...user, id: user.id };
      room.players.push(player);
      socket.join(roomId);
      socket.emit("room:joined", room);
      io.to(roomId).emit("room:playerJoined", { roomId, player });
      io.emit("room:list", rooms);
    });

    socket.on("room:leave", (roomId) => {
      const user = socketToUserMap.get(socket.id);
      if (!user) {
        return;
      }

      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        return;
      }

      room.players = room.players.filter((p) => p.id !== user.id);
      socket.leave(roomId);
      socketToUserMap.delete(socket.id);
      io.to(roomId).emit("room:playerLeft", { roomId, playerId: user.id });
      io.emit("room:list", rooms);
    });

    socket.on("disconnect", () => {
      console.log(`🔥 User disconnected: ${socket.id}`);

      const user = socketToUserMap.get(socket.id);
      if (user) {
        // Remove user from all rooms they're in
        for (const room of rooms) {
          const playerIndex = room.players.findIndex((p) => p.id === user.id);
          if (playerIndex > -1) {
            room.players.splice(playerIndex, 1);
            io.to(room.id).emit("room:playerLeft", {
              roomId: room.id,
              playerId: user.id,
            });
            io.emit("room:list", rooms);
            break; // A user can only be in one room at a time
          }
        }
        socketToUserMap.delete(socket.id);
      }
    });
  });

  console.log("✅ Socket.IO server initialized");
  return io;
}
