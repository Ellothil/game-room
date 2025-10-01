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

type GameState = {
  board: Array<"X" | "O" | null>;
  currentPlayer: "X" | "O";
  status: "waiting" | "playing" | "finished";
  playerSymbols: Map<string, "X" | "O">;
};

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

// Track game states for each room
const gameStates = new Map<string, GameState>();

// Tic-Tac-Toe board constants
const boardSize = 9;
const firstRowStart = 0;
const firstRowMid = 1;
const firstRowEnd = 2;
const secondRowStart = 3;
const secondRowMid = 4;
const secondRowEnd = 5;
const thirdRowStart = 6;
const thirdRowMid = 7;
const thirdRowEnd = 8;

const winPatterns = [
  [firstRowStart, firstRowMid, firstRowEnd],
  [secondRowStart, secondRowMid, secondRowEnd],
  [thirdRowStart, thirdRowMid, thirdRowEnd],
  [firstRowStart, secondRowStart, thirdRowStart],
  [firstRowMid, secondRowMid, thirdRowMid],
  [firstRowEnd, secondRowEnd, thirdRowEnd],
  [firstRowStart, secondRowMid, thirdRowEnd],
  [firstRowEnd, secondRowMid, thirdRowStart],
] as const;

export function initSocketServer(server: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: [
        `${process.env.VITE_CLIENT_URL}:${process.env.VITE_CLIENT_PORT}`,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
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

      const player: Player = { ...user, id: user.id, joinedAt: Date.now() };
      room.players.push(player);
      socket.join(roomId);
      socket.emit("room:joined", room);
      // Broadcast to other players in the room, not to the joining player
      socket.to(roomId).emit("room:playerJoined", { roomId, player });
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

    socket.on("game:start", (roomId) => {
      const user = socketToUserMap.get(socket.id);
      if (!user) {
        return;
      }

      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        return;
      }

      // Only allow starting if room has exactly 2 players
      if (room.players.length !== room.maxPlayers) {
        socket.emit("game:error", {
          message: "Need 2 players to start the game.",
        });
        return;
      }

      // Initialize game state
      const playerSymbols = new Map<string, "X" | "O">();
      playerSymbols.set(room.players[0].id, "X");
      playerSymbols.set(room.players[1].id, "O");

      gameStates.set(roomId, {
        board: Array.from({ length: boardSize }).fill(null) as Array<
          "X" | "O" | null
        >,
        currentPlayer: "X",
        status: "playing",
        playerSymbols,
      });

      // Notify all players in the room
      io.to(roomId).emit("game:start", {
        roomId,
        gameType: "tic-tac-toe",
        players: [
          { playerId: room.players[0].id, symbol: "X" },
          { playerId: room.players[1].id, symbol: "O" },
        ],
      });

      console.log(`🎮 Game started in room ${roomId}`);
    });

    socket.on("game:move", ({ roomId, moveData }) => {
      const user = socketToUserMap.get(socket.id);
      if (!user) {
        return;
      }

      const gameState = gameStates.get(roomId);
      if (!gameState) {
        socket.emit("game:error", { message: "Game not started." });
        return;
      }

      // Verify it's the player's turn
      const playerSymbol = gameState.playerSymbols.get(user.id);
      if (!playerSymbol) {
        socket.emit("game:error", { message: "You are not a player." });
        return;
      }

      if (playerSymbol !== gameState.currentPlayer) {
        socket.emit("game:error", { message: "Not your turn." });
        return;
      }

      // Verify the move is valid
      if (gameState.board[moveData.index]) {
        socket.emit("game:error", { message: "Cell already occupied." });
        return;
      }

      // Make the move
      gameState.board[moveData.index] = playerSymbol;
      gameState.currentPlayer = playerSymbol === "X" ? "O" : "X";

      // Check for winner
      const winner = checkWinner(gameState.board);
      const isBoardFull = gameState.board.every((cell) => cell !== null);
      const gameEnded = winner || isBoardFull;

      if (gameEnded) {
        gameState.status = "finished";
        io.to(roomId).emit("game:end", {
          roomId,
          winner: winner || "draw",
          board: gameState.board,
        });
        gameStates.delete(roomId);
        return;
      }

      // Broadcast the move to all players in the room
      io.to(roomId).emit("game:move", {
        roomId,
        move: moveData,
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
      });
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
            // Clear game state if exists
            gameStates.delete(room.id);
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

// Helper function to check for a winner
function checkWinner(board: Array<"X" | "O" | null>): "X" | "O" | null {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}
