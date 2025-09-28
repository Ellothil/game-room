/** biome-ignore-all lint/suspicious/noConsole: <false positive> */

import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({
  override: true,
  path: path.join(__dirname, "../../../client/.env"),
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
