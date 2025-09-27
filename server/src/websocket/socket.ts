/** biome-ignore-all lint/suspicious/noConsole: <console is ok> */

import type { Server as HttpServer } from "node:http";
import { join } from "node:path";
import dotenv from "dotenv";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "shared/websocket/types";
import { Server } from "socket.io";

dotenv.config({
  override: true,
  path: join(__dirname, "../../../client/.env"),
});

export function initSocketServer(server: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: `${process.env.VITE_CLIENT_URL}:${process.env.VITE_CLIENT_PORT}`,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡️ User connected: ${socket.id}`);

    socket.on("test:ping", (payload) => {
      console.log(`Received ping from ${socket.id}: ${payload.message}`);
      socket.emit("test:pong", { message: "Pong from server! 👋" });
    });

    socket.on("disconnect", () => {
      console.log(`🔥 User disconnected: ${socket.id}`);
    });
  });

  io.on("disconnect", (socket) => {
    console.log(`🔥 User disconnected: ${socket.id}`);
  });

  console.log("✅ Socket.IO server initialized");
  return io;
}
