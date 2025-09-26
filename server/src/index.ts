/** biome-ignore-all lint/suspicious/noConsole: false positive */

import { createServer } from "node:http";
import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import { query } from "./db"; // Import our database query function
import { connectRedis } from "./redis"; // Import our Redis connection function

// Load environment variables
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server);

const DEFAULT_PORT = 4001;
const PORT = process.env.PORT || DEFAULT_PORT;

app.get("/", (_req, res) => {
  res.send("Server is running!");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const LISTENING_REGEX = /LISTENING\s+(\d+)/;

const startServer = async () => {
  // Force kill any existing process on the port (Windows specific)
  try {
    const { execSync } = require("node:child_process");
    const result = execSync(`netstat -ano | findstr :${PORT}`, {
      encoding: "utf8",
    });
    const lines = result.trim().split("\n");
    for (const line of lines) {
      const match = line.match(LISTENING_REGEX);
      if (match) {
        const pid = match[1];
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.log(`Killed process ${pid} using port ${PORT}`);
        } catch (killError) {
          console.log(`Could not kill process ${pid}: ${killError}`);
        }
      }
    }
  } catch (_error) {
    // No process found on port, this is expected
  }

  // Connect to Redis before starting the server
  await connectRedis();

  // Test database connection
  try {
    await query("SELECT NOW()");
    console.log("🐘 PostgreSQL connected successfully!");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown handling
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
};

startServer();
