/**
 * Email Service — Nodemailer-based email dispatch
 *
 * Supports any SMTP provider via environment variables.
 * Works with: Gmail, SendGrid, Mailgun, SMTP2GO, or any custom SMTP server.
 *
 * Required env vars:
 *   EMAIL_USER             — SMTP username (e.g. your email address)
 *   EMAIL_PASS             — SMTP password or App Password
 *
 * Optional env vars (default to Gmail SMTP):
 *   SMTP_HOST              — SMTP server host   (default: smtp.gmail.com)
 *   SMTP_PORT              — SMTP server port   (default: 587)
 *   SMTP_SECURE            — use TLS?           (default: false)
 *   EMAIL_FROM_NAME        — sender display name (default: "Volunteer Rewards App")
 *
 * Mounted at: src/services/email.service.js
 * Required by: auth.service.js (verification & password reset), contact.routes.js
 *
 * Dependencies: nodemailer (npm)
 */

const nodemailer = require("nodemailer");

//-----------------------------------------------------------------------
// SECTION: Transporter Configuration
// Purpose: Create reusable Nodemailer transporter from env vars.
//          Defaults to Gmail SMTP if SMTP_HOST is not set.
//          Falls back to dry-run mode if no EMAIL_USER/EMAIL_PASS.
//-----------------------------------------------------------------------

function createTransporter() {
  const host  = process.env.SMTP_HOST || "smtp.gmail.com";
  const port  = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";

  // Gmail specific: if using port 465, secure must be true
  const isGmail = host.includes("gmail.com");

  return nodemailer.createTransport({
    host,
    port: isGmail && !process.env.SMTP_PORT ? 465 : port,
    secure: isGmail && !process.env.SMTP_SECURE ? true : secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

let transporter = null;

function getTransporter() {
  if (!transporter) transporter = createTransporter();
  return transporter;
}

// Allow re-creating transporter after env var changes (e.g. in tests)
function resetTransporter() {
  transporter = null;
}

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

  const fromName = process.env.EMAIL_FROM_NAME || "Volunteer Rewards App";
  const tp = getTransporter();
  const info = await tp.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  return { messageId: info.messageId };
}

//-----------------------------------------------------------------------
// SECTION: Verification Email Template
// Purpose: Generate HTML for email verification links sent after registration.
//-----------------------------------------------------------------------
function buildVerificationEmailHtml({ name, verificationUrl }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6; padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:24px; letter-spacing:-0.5px;">Volunteering Rewards</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0 0; font-size:14px;">Verify your email address</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="font-size:16px; color:#1f2937; margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
          <p style="font-size:14px; color:#4b5563; margin:0 0 20px 0; line-height:1.6;">
            Thank you for registering! Please confirm your email address by clicking the button below.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
            <tr><td align="center" style="background:#6366f1; border-radius:12px; padding:14px 32px;">
              <a href="${verificationUrl}" style="color:#fff; font-size:15px; font-weight:700; text-decoration:none; display:block;">Verify Email Address</a>
            </td></tr>
          </table>
          <p style="font-size:12px; color:#9ca3af; margin:0 0 8px 0; text-align:center;">
            Or copy this link into your browser:
          </p>
          <p style="font-size:11px; color:#6b7280; text-align:center; word-break:break-all; margin:0;">
            ${verificationUrl}
          </p>
          <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
          <p style="font-size:12px; color:#9ca3af; margin:0; text-align:center;">
            This link expires in 24 hours. If you did not create an account, please ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

//-----------------------------------------------------------------------
// SECTION: Password Reset Email Template
// Purpose: Generate HTML for password reset links.
//-----------------------------------------------------------------------
function buildPasswordResetEmailHtml({ name, resetUrl }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6; padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444); padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:24px; letter-spacing:-0.5px;">Volunteering Rewards</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0 0; font-size:14px;">Reset your password</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="font-size:16px; color:#1f2937; margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
          <p style="font-size:14px; color:#4b5563; margin:0 0 20px 0; line-height:1.6;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
            <tr><td align="center" style="background:#f59e0b; border-radius:12px; padding:14px 32px;">
              <a href="${resetUrl}" style="color:#fff; font-size:15px; font-weight:700; text-decoration:none; display:block;">Reset Password</a>
            </td></tr>
          </table>
          <p style="font-size:12px; color:#9ca3af; margin:0 0 8px 0; text-align:center;">
            Or copy this link into your browser:
          </p>
          <p style="font-size:11px; color:#6b7280; text-align:center; word-break:break-all; margin:0;">
            ${resetUrl}
          </p>
          <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
          <p style="font-size:12px; color:#9ca3af; margin:0; text-align:center;">
            This link expires in 1 hour. If you did not request a password reset, please ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { sendEmail, buildVerificationEmailHtml, buildPasswordResetEmailHtml, resetTransporter };
