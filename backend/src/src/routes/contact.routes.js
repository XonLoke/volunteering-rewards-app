const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { pool } = require("../config/database");
const { sendEmail } = require("../services/email.service");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded.userId || decoded.user_id,
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const userResult = await pool.query(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

    await sendEmail({
      to: supportEmail,
      subject: `[Volunteer Rewards Support] ${subject}`,
      replyTo: user.email,
      text: `
New Contact Us Message

From: ${user.name}
Email: ${user.email}
User ID: ${user.id}

Subject:
${subject}

Message:
${message}
      `,
      html: `
        <h2>New Contact Us Message</h2>
        <p><strong>From:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        <hr />
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    res.json({
      message: "Message sent successfully",
      sentTo: supportEmail,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;