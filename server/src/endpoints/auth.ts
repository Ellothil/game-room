import bcrypt from "bcrypt";
import { Router } from "express";
import pool from "../postgres";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR } from "./http-codes";

const router: Router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Username and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, display_name, profile_completed",
      [username, hashedPassword]
    );
    const user = result.rows[0];
    res.status(CREATED).json({
      message: "User registered successfully",
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      profileCompleted: user.profile_completed,
    });
  } catch (error) {
    // Handle PostgreSQL unique constraint violation (duplicate username)
    if (error instanceof Error && "code" in error) {
      const pgError = error as { code: string; constraint?: string };

      // PostgreSQL error code 23505 = unique_violation
      if (pgError.code === "23505") {
        return res
          .status(BAD_REQUEST)
          .json({ error: "Username already exists" });
      }
    }

    // Log error for debugging
    process.stderr.write(`Registration error: ${error}\n`);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Username and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, pp.file_path as profile_picture 
       FROM users u 
       LEFT JOIN profile_pictures pp ON u.current_profile_picture_id = pp.id 
       WHERE u.username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(BAD_REQUEST).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(BAD_REQUEST).json({ error: "Invalid password" });
    }
    res.json({
      message: "Login successful",
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      profilePicture: user.profile_picture,
      profileCompleted: user.profile_completed,
    });
  } catch (error) {
    // Log error for debugging
    process.stderr.write(`Login error: ${error}\n`);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to login user" });
  }
});

export default router;
