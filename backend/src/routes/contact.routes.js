/**
 * Contact Routes — Support ticket / contact form submission
 *
 * Endpoints:
 *   POST /api/contact   — Submit a support message (emails support team)
 *
 * Mounted at: /api/contact (see index.js)
 * Auth: JWT Bearer token (uses shared auth.middleware)
 *
 * Original by Vivian, adapted by Xon to use shared middleware.
 * Requires EMAIL_USER and EMAIL_PASS (or SUPPORT_EMAIL) env vars.
 */

const { Router } = require("express");
const router = Router();
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth.middleware");
const { sendEmail } = require("../services/email.service");

// All contact routes require authentication
router.use(authenticate);

//-----------------------------------------------------------------------
// SECTION: POST /api/contact
// Purpose: Submit a support ticket via email.
//          Validates subject and message. Looks up user info
//          and sends an email to the support team.
//-----------------------------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;

    // Validate required fields
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        error: { code: "validation_error", message: "Subject is required." },
      });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: { code: "validation_error", message: "Message is required." },
      });
    }

    // Fetch user info for the support email
    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: { code: "not_found", message: "User not found." },
      });
    }

    const user = userResult.rows[0];
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || "support@volunteerrewards.app";

    // Send support email
    await sendEmail({
      to: supportEmail,
      subject: `[Volunteer Rewards Support] ${subject}`,
      replyTo: user.email,
      text: `New Contact Us Message

From: ${user.name}
Email: ${user.email}
User ID: ${user.id}

Subject:
${subject}

Message:
${message}`,
      html: `
        <h2>New Contact Us Message</h2>
        <p><strong>From:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        <hr />
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br />")}</p>`,
    });

    res.status(201).json({
      message: "Your message has been sent. We'll get back to you soon.",
      sentTo: supportEmail,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
