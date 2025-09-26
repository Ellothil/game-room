/** biome-ignore-all lint/suspicious/noConsole: <false positive> */
import { createClient } from "redis";

// Create a new Redis client. By default it connects to redis://127.0.0.1:6379
const redisClient = createClient();

redisClient.on("connect", () => {
  console.log("⚡️ Connected to Redis!");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// We must connect the client manually
const connectRedis = async () => {
  await redisClient.connect();
};

// We export the client for use in other parts of the application
export { redisClient, connectRedis };
