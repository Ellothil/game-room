import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Initialize game rooms on startup
crons.interval(
  "initialize game rooms",
  { minutes: 60 }, // Run every hour to ensure rooms exist
  internal.gameRooms.initializeGameRooms,
  {}
);

// Clean up inactive members every 30 minutes
crons.interval(
  "cleanup inactive members",
  { minutes: 30 },
  internal.gameRooms.cleanupInactiveMembers,
  {}
);

export default crons;
