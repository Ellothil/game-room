// server/src/db/index.ts
/** biome-ignore-all lint/suspicious/noConsole: <false positive> */
import { Pool } from "pg";

// The Pool will use the default environment variables for connection,
// which Docker Compose conveniently provides.
// Or you can specify them:
const pool = new Pool({
  user: "robo_user",
  host: "localhost",
  database: "roborally",
  password: "robo_password",
  port: 5432,
});

console.log("🐘 PostgreSQL connection pool created.");

// We export a query function that uses a client from the pool
export const query = (text: string, params?: any[]) => pool.query(text, params);
