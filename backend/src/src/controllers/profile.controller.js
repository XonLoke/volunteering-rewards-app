const db = require("../config/database");
const pool = db.pool || db;
const path = require("path");
const fs = require("fs");

function buildFullAvatarUrl(req, avatarUrl) {
  if (!avatarUrl) return null;

  if (avatarUrl.startsWith("http")) {
    return avatarUrl;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}${avatarUrl}`;
}

async function getProfile(req, res) {
  try {
    const userId = req.query.user_id || req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        name,
        email,
        phone,
        points,
        avatar_url
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      user: {
        ...user,
        avatar_url: buildFullAvatarUrl(req, user.avatar_url),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile.",
      error: error.message,
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.body.user_id || req.headers["x-user-id"];
    const { name, email, phone } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required.",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET 
        name = $1,
        email = $2,
        phone = $3
      WHERE id = $4
      RETURNING id, name, email, phone, points, avatar_url
      `,
      [name.trim(), email.trim().toLowerCase(), phone || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...user,
        avatar_url: buildFullAvatarUrl(req, user.avatar_url),
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
}

async function uploadAvatar(req, res) {
  try {
    const userId =
      req.body.user_id || req.query.user_id || req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id, avatar_url FROM users WHERE id = $1",
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldAvatarUrl = existingUser.rows[0].avatar_url;

    if (oldAvatarUrl && oldAvatarUrl.startsWith("/uploads/profile-pictures/")) {
      const oldFilePath = path.join(__dirname, "../..", oldAvatarUrl);

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const avatarUrl = `/uploads/profile-pictures/${req.file.filename}`;

    const updated = await pool.query(
      `
      UPDATE users
      SET avatar_url = $1
      WHERE id = $2
      RETURNING id, name, email, phone, points, avatar_url
      `,
      [avatarUrl, userId]
    );

    const user = updated.rows[0];

    return res.json({
      success: true,
      message: "Profile picture updated successfully.",
      user: {
        ...user,
        avatar_url: buildFullAvatarUrl(req, user.avatar_url),
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile picture.",
      error: error.message,
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
};