// client/src/socket.ts
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "shared/websocket/types";
import { io, type Socket } from "socket.io-client";

const URL = `${import.meta.env.VITE_SOCKET_URL}:${import.meta.env.VITE_SOCKET_PORT}`;
console.log(URL);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false,
  }
);
