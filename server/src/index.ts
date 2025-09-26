/** biome-ignore-all lint/suspicious/noConsole: false positive */
import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";
import { query } from "./db"; // Import our database query function
import { connectRedis } from "./redis"; // Import our Redis connection function

const app = express();
const server = createServer(app);
const io = new Server(server);

const DEFAULT_PORT = 4000;
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

const startServer = async () => {
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
};

startServer();
