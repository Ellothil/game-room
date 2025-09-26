// server/src/db/index.ts
/** biome-ignore-all lint/suspicious/noConsole: <false positive> */

// import dotenv from "dotenv";
import { Pool } from "pg";

// Load environment variables
// dotenv.config({ path: "../../.env" });

const pool = new Pool({
  user: "root",
  password: "password",
  host: "localhost",
  port: 5432,
  database: "root",
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
