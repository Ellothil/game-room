import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    visibleName: v.string(),
    profilePicture: v.optional(v.id("_storage")),
  }).index("by_user", ["userId"]),

  gameRooms: defineTable({
    gameId: v.string(), // unique identifier for the game type
    name: v.string(),
    description: v.string(),
    minPlayers: v.number(),
    maxPlayers: v.number(),
    isActive: v.boolean(),
  }).index("by_game_id", ["gameId"]),

  roomMembers: defineTable({
    roomId: v.id("gameRooms"),
    userId: v.id("users"),
    isReady: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  ticTacToeGames: defineTable({
    roomId: v.id("gameRooms"),
    board: v.array(v.union(v.string(), v.null())),
    currentPlayer: v.id("users"),
    player1: v.id("users"),
    player2: v.id("users"),
    winner: v.union(v.string(), v.null()),
    gameOver: v.boolean(),
    moves: v.number(),
  }).index("by_room", ["roomId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
