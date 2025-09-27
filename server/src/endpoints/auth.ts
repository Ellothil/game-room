import { Router } from "express";
import pool from "../postgres";

const authRouter: Router = Router();

const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Username and password are required" });
  }

  try {
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, password]
    );
    res.json({ message: "User registered successfully" });
  } catch (error) {
    // Log error for debugging
    process.stderr.write(`Registration error: ${error}\n`);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to register user" });
  }
});

authRouter.post("/login", (req, res) => {
  res.send("Login");
});
authRouter.get("/me", (_req, res) => {
  res.send("Me");
});

authRouter.post("/logout", (req, res) => {
  res.send("Logout");
});

export default authRouter;
