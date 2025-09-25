import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    let profilePictureUrl = null;
    if (profile.profilePicture) {
      profilePictureUrl = await ctx.storage.getUrl(profile.profilePicture);
    }

    return {
      ...profile,
      profilePictureUrl,
    };
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return null;

    let profilePictureUrl = null;
    if (profile.profilePicture) {
      profilePictureUrl = await ctx.storage.getUrl(profile.profilePicture);
    }

    return {
      ...profile,
      profilePictureUrl,
    };
  },
});

export const createProfile = mutation({
  args: {
    visibleName: v.string(),
    profilePicture: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("userProfiles", {
      userId,
      visibleName: args.visibleName,
      profilePicture: args.profilePicture,
    });
  },
});

export const updateProfile = mutation({
  args: {
    visibleName: v.string(),
    profilePicture: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      visibleName: args.visibleName,
      profilePicture: args.profilePicture,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});
