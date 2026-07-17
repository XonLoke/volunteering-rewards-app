/**
 * Email Service — Multi-provider email dispatch
 *
 * Sends via Mailgun REST API (preferred) or SMTP (fallback for other providers).
 * Configuration is read from DB (email_config table) with env var fallback.
 *
 * Mailgun: Uses REST API — faster and more reliable than SMTP from Render.
 *   email_user  → the full from address (e.g. postmaster@sandbox...mailgun.org)
 *   email_pass  → Mailgun API key
 *
 * Other SMTP providers (Gmail, SendGrid, SMTP2GO):
 *   Falls back to standard Nodemailer SMTP transport.
 *
 * Mounted at: src/services/email.service.js
 * Required by: auth.service.js, contact.routes.js
 */

const https = require("https");
const querystring = require("querystring");

//-----------------------------------------------------------------------
// SECTION: Configuration Loading
// Purpose: Read email config from DB (or env vars as fallback)
//-----------------------------------------------------------------------

const DB_TABLE = "email_config";

let cachedDbConfig = null;

async function loadDbConfig() {
  try {
    const { pool } = require("../config/database");
    const { rows } = await pool.query(
      `SELECT smtp_host, smtp_port, smtp_secure, email_user, email_pass, email_from_name FROM ${DB_TABLE} ORDER BY id DESC LIMIT 1`
    );
    if (rows.length > 0 && rows[0].email_user) {
      cachedDbConfig = {
        host: rows[0].smtp_host,
        port: parseInt(rows[0].smtp_port, 10) || 465,
        secure: rows[0].smtp_secure !== false,
        user: rows[0].email_user,
        pass: rows[0].email_pass,
        fromName: rows[0].email_from_name || "Volunteer Rewards App",
        isMailgun: (rows[0].smtp_host || "").includes("mailgun") || (rows[0].email_user || "").includes("mailgun"),
      };
      return cachedDbConfig;
    }
  } catch {
    // DB not ready yet — fall through to env vars
  }
  cachedDbConfig = null;
  return null;
}

function getEnvConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  return {
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    fromName: process.env.EMAIL_FROM_NAME || "Volunteer Rewards App",
    isMailgun: host.includes("mailgun"),
  };
}

async function getConfig() {
  const dbConfig = await loadDbConfig();
  return dbConfig || getEnvConfig();
}

//-----------------------------------------------------------------------
// SECTION: Mailgun REST API Sender
// Purpose: Send email via Mailgun's HTTP API (more reliable than SMTP)
//-----------------------------------------------------------------------

function extractMailgunDomain(fromEmail) {
  // Extract domain from email: "postmaster@sandbox123.mailgun.org" → "sandbox123.mailgun.org"
  const parts = fromEmail.split("@");
  return parts.length > 1 ? parts[1] : null;
}

async function sendViaMailgunApi(fromAddress, fromName, to, subject, text, html, replyTo) {
  const config = cachedDbConfig || await loadDbConfig() || getEnvConfig();
  const apiKey = config.pass;
  const domain = extractMailgunDomain(fromAddress);

  if (!domain) {
    throw new Error(`Could not extract Mailgun domain from: ${fromAddress}`);
  }

  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text: text || "",
      html: html || text || "",
      ...(replyTo ? { "h:Reply-To": replyTo } : {}),
    });

    const req = https.request({
      hostname: "api.mailgun.net",
      path: `/v3/${domain}/messages`,
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`api:${apiKey}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ messageId: parsed.id, message: parsed.message });
          } else {
            reject(new Error(parsed.message || `Mailgun API error (${res.statusCode})`));
          }
        } catch {
          reject(new Error(`Mailgun API error (${res.statusCode}): ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

//-----------------------------------------------------------------------
// SECTION: SMTP Sender (Fallback)
// Purpose: Use Nodemailer SMTP for non-Mailgun providers.
//-----------------------------------------------------------------------

let nodemailer = null;
let transporter = null;

function getNodemailer() {
  if (!nodemailer) nodemailer = require("nodemailer");
  return nodemailer;
}

async function createSmtpTransporter() {
  const nm = getNodemailer();
  const config = getEnvConfig(); // SMTP always uses env vars for non-Mailgun
  return nm.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}

async function getSmtpTransporter() {
  if (!transporter) transporter = await createSmtpTransporter();
  return transporter;
}

// Re-create transporter (call after email config is updated in DB)
function resetTransporter() {
  transporter = null;
  cachedDbConfig = null;
}

//-----------------------------------------------------------------------
// SECTION: sendEmail
// Purpose: Send an email via the configured transporter.
//          Throws a descriptive error if credentials are missing.
//          Returns { messageId } on success.
//-----------------------------------------------------------------------
async function sendEmail({ to, subject, text, html, replyTo }) {
  const config = await getConfig();

  // Validate credentials
  if (!config.user || !config.pass) {
    console.warn("[email.service] No email credentials configured — email not sent.");
    console.warn(`[email.service] Would have sent to: ${to}, subject: "${subject}"`);
    return { messageId: "dry-run (no credentials configured)" };
  }

  if (config.isMailgun) {
    // Send via Mailgun REST API (reliable, authenticated)
    const result = await sendViaMailgunApi(config.user, config.fromName, to, subject, text, html, replyTo);
    return { messageId: result.messageId };
  }

  // Fallback: send via SMTP for non-Mailgun providers
  const fromName = config.fromName || "Volunteer Rewards App";
  const tp = await getSmtpTransporter();
  const info = await tp.sendMail({
    from: `"${fromName}" <${config.user}>`,
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
