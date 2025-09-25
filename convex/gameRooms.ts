import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic 3x3 grid game. Get three in a row to win!",
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: "chess",
    name: "Chess",
    description: "The classic strategy game. Coming soon!",
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: "checkers",
    name: "Checkers",
    description: "Jump over your opponent's pieces. Coming soon!",
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: "card-game",
    name: "Card Game",
    description: "Multiplayer card battles. Coming soon!",
    minPlayers: 2,
    maxPlayers: 6,
  },
];

export const initializeGameRooms = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if rooms already exist
    const existingRooms = await ctx.db.query("gameRooms").collect();
    
    if (existingRooms.length === 0) {
      // Create permanent rooms for each game
      for (const game of GAMES) {
        await ctx.db.insert("gameRooms", {
          gameId: game.id,
          name: game.name,
          description: game.description,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          isActive: true,
        });
      }
    }
  },
});

function determineHost(members: any[]) {
  if (members.length === 0) return null;
  // Host is the member who joined earliest (lowest joinedAt timestamp)
  return members.reduce((earliest, current) => 
    current.joinedAt < earliest.joinedAt ? current : earliest
  );
}

export const listGameRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("gameRooms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const roomsWithMembers = await Promise.all(
      rooms.map(async (room) => {
        const members = await ctx.db
          .query("roomMembers")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();

        const memberProfiles = await Promise.all(
          members.map(async (member) => {
            const profile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", member.userId))
              .unique();

            let profilePictureUrl = null;
            if (profile?.profilePicture) {
              profilePictureUrl = await ctx.storage.getUrl(profile.profilePicture);
            }

            return {
              ...member,
              profile: profile ? { ...profile, profilePictureUrl } : null,
            };
          })
        );

        // Determine host
        const host = determineHost(memberProfiles);

        // Check game status
        const readyCount = members.filter(m => m.isReady).length;
        const hasMinPlayers = members.length >= room.minPlayers;
        const allReady = members.length > 0 && members.every(m => m.isReady);

        return {
          ...room,
          memberCount: members.length,
          members: memberProfiles,
          readyCount,
          hasMinPlayers,
          allReady,
          host: host ? host.userId : null,
        };
      })
    );

    return roomsWithMembers;
  },
});

export const getRoomDetails = query({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) return null;

    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const memberProfiles = await Promise.all(
      members.map(async (member) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .unique();

        let profilePictureUrl = null;
        if (profile?.profilePicture) {
          profilePictureUrl = await ctx.storage.getUrl(profile.profilePicture);
        }

        return {
          ...member,
          profile: profile ? { ...profile, profilePictureUrl } : null,
        };
      })
    );

    // Determine host
    const host = determineHost(memberProfiles);

    // Check game status
    const hasMinPlayers = members.length >= room.minPlayers;
    const allReady = members.length > 0 && members.every(m => m.isReady);

    return {
      ...room,
      members: memberProfiles,
      hasMinPlayers,
      allReady,
      host: host ? host.userId : null,
    };
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) {
      throw new Error("Room not found or inactive");
    }

    // Check if user is already in any room
    const existingMembership = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingMembership) {
      // If already in this room, do nothing
      if (existingMembership.roomId === args.roomId) {
        return;
      }
      // Leave current room first
      await ctx.db.delete(existingMembership._id);
    }

    // Check room capacity
    const currentMembers = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (currentMembers.length >= room.maxPlayers) {
      throw new Error("Room is full");
    }

    await ctx.db.insert("roomMembers", {
      roomId: args.roomId,
      userId,
      isReady: false,
      joinedAt: Date.now(),
    });
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not in room");
    }

    await ctx.db.delete(membership._id);
  },
});

export const toggleReady = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not in room");
    }

    const newReadyState = !membership.isReady;
    await ctx.db.patch(membership._id, {
      isReady: newReadyState,
    });
  },
});

export const startGame = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) {
      throw new Error("Room not found or inactive");
    }

    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Determine host
    const host = determineHost(members);
    if (!host || host.userId !== userId) {
      throw new Error("Only the host can start the game");
    }

    // Check if game can be started
    const hasMinPlayers = members.length >= room.minPlayers;
    const allReady = members.length > 0 && members.every(m => m.isReady);

    if (!hasMinPlayers) {
      throw new Error(`Need at least ${room.minPlayers} players to start`);
    }

    if (!allReady) {
      throw new Error("All players must be ready to start");
    }

    // Mark room as having started game (this could be expanded with game state)
    return { success: true, message: "Game started!" };
  },
});

export const getCurrentUserRoom = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) return null;

    const room = await ctx.db.get(membership.roomId);
    if (!room || !room.isActive) return null;

    return room;
  },
});

export const cleanupInactiveMembers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour in milliseconds
    
    // Find all members who joined more than 1 hour ago and are not ready
    const members = await ctx.db.query("roomMembers").collect();
    
    let cleanedCount = 0;
    
    for (const member of members) {
      if (member.joinedAt < oneHourAgo && !member.isReady) {
        await ctx.db.delete(member._id);
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} inactive members`);
    return cleanedCount;
  },
});
