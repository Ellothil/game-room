import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import type { Request } from "express";
import { Router } from "express";
import type { FileFilterCallback } from "multer";
import multer from "multer";
import pool from "../postgres";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR } from "./http-codes";

const router: Router = Router();

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RANDOM_MULTIPLIER = 1e9;

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../../../uploads/profile-pictures");

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * RANDOM_MULTIPLIER)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
        )
      );
    }
  },
});

// Complete profile setup (first-time)
router.post("/setup", async (req, res) => {
  const { userId, displayName } = req.body;

  if (!userId) {
    return res.status(BAD_REQUEST).json({ error: "User ID is required" });
  }

  try {
    // Get username if displayName is empty
    const userResult = await pool.query(
      "SELECT username FROM users WHERE id = $1",
      [userId]
    );
    const username = userResult.rows[0]?.username;

    if (!username) {
      return res.status(BAD_REQUEST).json({ error: "User not found" });
    }

    const finalDisplayName = displayName?.trim() || username;

    await pool.query(
      "UPDATE users SET display_name = $1, profile_completed = TRUE WHERE id = $2",
      [finalDisplayName, userId]
    );

    res.json({
      message: "Profile setup completed",
      displayName: finalDisplayName,
    });
  } catch (error) {
    process.stderr.write(`Profile setup error: ${error}\n`);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to setup profile" });
  }
});

// Upload profile picture
router.post("/upload-picture", upload.single("picture"), async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(BAD_REQUEST).json({ error: "User ID is required" });
  }

  if (!req.file) {
    return res.status(BAD_REQUEST).json({ error: "No file uploaded" });
  }

  try {
    const filePath = `/uploads/profile-pictures/${req.file.filename}`;

    const result = await pool.query(
      "INSERT INTO profile_pictures (user_id, file_name, file_path) VALUES ($1, $2, $3) RETURNING id, file_path",
      [userId, req.file.filename, filePath]
    );

    const pictureId = result.rows[0].id;
    const pictureUrl = result.rows[0].file_path;

    // Set as current profile picture if user doesn't have one
    const userResult = await pool.query(
      "SELECT current_profile_picture_id FROM users WHERE id = $1",
      [userId]
    );

    if (!userResult.rows[0]?.current_profile_picture_id) {
      await pool.query(
        "UPDATE users SET current_profile_picture_id = $1 WHERE id = $2",
        [pictureId, userId]
      );
    }

    res.status(CREATED).json({
      message: "Profile picture uploaded successfully",
      pictureId,
      pictureUrl,
    });
  } catch (error) {
    process.stderr.write(`Picture upload error: ${error}\n`);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to upload picture" });
  }
});

// Get user profile pictures
router.get("/pictures/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, file_path, uploaded_at FROM profile_pictures WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [userId]
    );

    res.json({ pictures: result.rows });
  } catch (error) {
    process.stderr.write(`Get pictures error: ${error}\n`);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to get pictures" });
  }
});

// Set current profile picture
router.post("/set-current-picture", async (req, res) => {
  const { userId, pictureId } = req.body;

  if (!(userId && pictureId)) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "User ID and picture ID are required" });
  }

  try {
    // Verify picture belongs to user
    const pictureResult = await pool.query(
      "SELECT id FROM profile_pictures WHERE id = $1 AND user_id = $2",
      [pictureId, userId]
    );

    if (pictureResult.rows.length === 0) {
      return res.status(BAD_REQUEST).json({ error: "Picture not found" });
    }

    await pool.query(
      "UPDATE users SET current_profile_picture_id = $1 WHERE id = $2",
      [pictureId, userId]
    );

    res.json({ message: "Current profile picture updated" });
  } catch (error) {
    process.stderr.write(`Set current picture error: ${error}\n`);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to set current picture" });
  }
});

// Delete profile picture
router.delete("/picture/:pictureId", async (req, res) => {
  const { pictureId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(BAD_REQUEST).json({ error: "User ID is required" });
  }

  try {
    // Get picture details and verify ownership
    const pictureResult = await pool.query(
      "SELECT file_name, user_id FROM profile_pictures WHERE id = $1",
      [pictureId]
    );

    if (pictureResult.rows.length === 0) {
      return res.status(BAD_REQUEST).json({ error: "Picture not found" });
    }

    if (pictureResult.rows[0].user_id !== userId) {
      return res.status(BAD_REQUEST).json({ error: "Unauthorized" });
    }

    const fileName = pictureResult.rows[0].file_name;

    // Check if this is the current profile picture
    const userResult = await pool.query(
      "SELECT current_profile_picture_id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows[0]?.current_profile_picture_id === pictureId) {
      // Set to null if deleting current picture
      await pool.query(
        "UPDATE users SET current_profile_picture_id = NULL WHERE id = $1",
        [userId]
      );
    }

    // Delete from database
    await pool.query("DELETE FROM profile_pictures WHERE id = $1", [pictureId]);

    // Delete file from disk
    const filePath = path.join(uploadDir, fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    res.json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    process.stderr.write(`Delete picture error: ${error}\n`);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete picture" });
  }
});

// Update display name
router.post("/update-name", async (req, res) => {
  const { userId, displayName } = req.body;

  if (!(userId && displayName)) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "User ID and display name are required" });
  }

  try {
    await pool.query("UPDATE users SET display_name = $1 WHERE id = $2", [
      displayName.trim(),
      userId,
    ]);

    res.json({
      message: "Display name updated successfully",
      displayName: displayName.trim(),
    });
  } catch (error) {
    process.stderr.write(`Update name error: ${error}\n`);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to update name" });
  }
});

// Get user profile
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.profile_completed, 
              pp.file_path as profile_picture
       FROM users u
       LEFT JOIN profile_pictures pp ON u.current_profile_picture_id = pp.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(BAD_REQUEST).json({ error: "User not found" });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    process.stderr.write(`Get profile error: ${error}\n`);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to get profile" });
  }
});

export default router;
