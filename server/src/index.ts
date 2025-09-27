/** biome-ignore-all lint/suspicious/noConsole: false positive */
import { createServer } from "node:http";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { testConnection } from "./postgres";
import { connectRedis } from "./redis";
import { io } from "./websocket/index";

dotenv.config({ override: true, path: path.join(__dirname, "../../.env") });
const app = express();
const server = createServer(app);

const PORT = Number(process.env.PORT);

app.use(
  cors({
    origin: `${process.env.SOCKET_URL}:${process.env.SOCKET_PORT}`,
    methods: ["GET", "POST"],
  })
);

app.get("/", (_req, res) => {
  res.send("Server is running!");
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
  testConnection();
  // Log if connection was successful with icons
  // if (result.rowCount === 1) {
  //   console.log("⚡️Postgres connection successful");
  // } else {
  //   console.error("❌ Postgres connection failed");
  // }

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
