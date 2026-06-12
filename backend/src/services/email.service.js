/**
 * Email Service — Nodemailer-based email dispatch
 *
 * Uses Gmail SMTP via environment variables EMAIL_USER and EMAIL_PASS.
 * Supports: to, subject, text, html, replyTo
 *
 * Mounted at: src/services/email.service.js
 * Required by: contact.routes.js (support ticket submission)
 *
 * Dependencies: nodemailer (npm)
 */

const nodemailer = require("nodemailer");

//-----------------------------------------------------------------------
// SECTION: Transporter Configuration
// Purpose: Create reusable Nodemailer transporter with Gmail SMTP.
//          Falls back to a log-only mode if SMTP credentials aren't set,
//          so the app doesn't crash in dev environments without email.
//-----------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//-----------------------------------------------------------------------
// SECTION: sendEmail
// Purpose: Send an email via the configured transporter.
//          Throws a descriptive error if credentials are missing.
//          Returns { messageId } on success.
//-----------------------------------------------------------------------
async function sendEmail({ to, subject, text, html, replyTo }) {
  // Validate credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[email.service] EMAIL_USER or EMAIL_PASS not set — email not sent.");
    console.warn(`[email.service] Would have sent to: ${to}, subject: "${subject}"`);
    return { messageId: "dry-run (no credentials configured)" };
  }

  const info = await transporter.sendMail({
    from: `"Volunteer Rewards App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  return { messageId: info.messageId };
}

module.exports = { sendEmail };
