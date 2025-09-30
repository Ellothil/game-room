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
    origin: [
      `${process.env.VITE_CLIENT_URL}:${process.env.VITE_CLIENT_PORT}`,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ["GET", "POST"],
    credentials: true,
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

  const port = Number(PORT);
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
    console.log(`   Local: http://localhost:${port}`);
    console.log(`   Network: http://${process.env.PUBLIC_IP}:${port}`);
  });
};

startServer();
