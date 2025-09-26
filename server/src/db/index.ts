// server/src/db/index.ts
/** biome-ignore-all lint/suspicious/noConsole: <false positive> */
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  user: process.env.DB_USER || "robo_user",
  password: process.env.DB_PASSWORD || "robo_password", 
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_DATABASE || "roborally",
};

console.log("🔧 Database configuration:", {
  ...config,
  password: "***hidden***"
});

const pool = new Pool(config);

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// We export a query function that uses a client from the pool
export const query = (text: string, params?: any[]) => pool.query(text, params);
