/** biome-ignore-all lint/suspicious/noConsole: <console is ok> */

import path from "node:path";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config({ override: true, path: path.join(__dirname, "../../.env") });

export const io = new Server({
  cors: {
    origin: `${process.env.SOCKET_URL}:${process.env.SOCKET_PORT}`,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

io.listen(Number(process.env.SOCKET_PORT));
