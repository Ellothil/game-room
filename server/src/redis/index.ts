/** biome-ignore-all lint/suspicious/noConsole: <false positive> */
import { createClient } from "redis";

// Create a new Redis client configured for Docker Desktop
const redisClient = createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
  console.error(
    "Make sure Docker Desktop Redis container is running on port 6379"
  );
});

// We must connect the client manually
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("⚡️Redis connected");
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
  }
};

// We export the client for use in other parts of the application
export { redisClient, connectRedis };
