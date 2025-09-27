/** biome-ignore-all lint/suspicious/noConsole: <false positive> */

import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ override: true, path: path.join(__dirname, "../../.env") });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function testConnection() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT current_user");
    const currentUser = rows[0]["current_user"];
    console.log(`Connected as user: ${currentUser}`);
  } catch (error) {
    console.error("Postgres connection failed", error);
  } finally {
    client.release();
  }
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
