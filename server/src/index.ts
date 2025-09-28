/** biome-ignore-all lint/suspicious/noConsole: false positive */
import { createServer } from "node:http";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRouter from "./endpoints/auth";
import gameRoomsRouter from "./endpoints/rooms";
import { connectRedis } from "./redis";
import { initSocketServer } from "./websocket/socket";

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../client/.env") });

const app = express();
const server = createServer(app); // 👈 The single HTTP server

// Attach Socket.IO to the server
initSocketServer(server);

const PORT = process.env.PORT;

app.use(
  cors({
    origin: `${process.env.VITE_CLIENT_URL}:${process.env.VITE_CLIENT_PORT}`,
    methods: ["GET", "POST"],
  })
);

// Parse JSON request bodies
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server is running!");
});

app.use("/auth", authRouter);
app.use("/rooms", gameRoomsRouter);

const startServer = async () => {
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
};

startServer();
