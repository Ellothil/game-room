import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGameState = query({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const gameState = await ctx.db
      .query("ticTacToeGames")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    if (!gameState) return null;

    return gameState;
  },
});

export const initializeGame = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if game already exists
    const existingGame = await ctx.db
      .query("ticTacToeGames")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    if (existingGame) {
      return existingGame._id;
    }

    // Get room members to assign players and check host
    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (members.length < 2) {
      throw new Error("Need at least 2 players to start the game");
    }

    // Determine host (earliest joiner)
    const host = members.reduce((earliest, current) => 
      current.joinedAt < earliest.joinedAt ? current : earliest
    );

    // Only host can initialize the game
    if (host.userId !== userId) {
      throw new Error("Only the host can start the game");
    }

    // Assign first two members as players
    const player1 = members[0].userId;
    const player2 = members[1].userId;

    const gameId = await ctx.db.insert("ticTacToeGames", {
      roomId: args.roomId,
      board: Array(9).fill(null),
      currentPlayer: player1,
      player1,
      player2,
      winner: null,
      gameOver: false,
      moves: 0,
    });

    return gameId;
  },
});

export const makeMove = mutation({
  args: { 
    roomId: v.id("gameRooms"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const gameState = await ctx.db
      .query("ticTacToeGames")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    if (!gameState) {
      throw new Error("Game not found");
    }

    if (gameState.gameOver) {
      throw new Error("Game is already over");
    }

    if (gameState.currentPlayer !== userId) {
      throw new Error("Not your turn");
    }

    if (args.position < 0 || args.position > 8) {
      throw new Error("Invalid position");
    }

    if (gameState.board[args.position] !== null) {
      throw new Error("Position already taken");
    }

    // Make the move
    const newBoard = [...gameState.board];
    const symbol = userId === gameState.player1 ? 'X' : 'O';
    newBoard[args.position] = symbol;

    // Check for winner
    const winner = checkWinner(newBoard);
    const moves = gameState.moves + 1;
    const gameOver = winner !== null || moves === 9;

    // Switch to next player if game continues
    const nextPlayer = gameOver 
      ? gameState.currentPlayer 
      : (userId === gameState.player1 ? gameState.player2 : gameState.player1);

    await ctx.db.patch(gameState._id, {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner,
      gameOver,
      moves,
    });

    return { winner, gameOver };
  },
});

export const resetGame = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const gameState = await ctx.db
      .query("ticTacToeGames")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    if (!gameState) {
      throw new Error("Game not found");
    }

    // Get room members to check host
    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Determine host (earliest joiner)
    const host = members.reduce((earliest, current) => 
      current.joinedAt < earliest.joinedAt ? current : earliest
    );

    // Only host can reset the game
    if (host.userId !== userId) {
      throw new Error("Only the host can reset the game");
    }

    await ctx.db.patch(gameState._id, {
      board: Array(9).fill(null),
      currentPlayer: gameState.player1,
      winner: null,
      gameOver: false,
      moves: 0,
    });
  },
});

function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}
