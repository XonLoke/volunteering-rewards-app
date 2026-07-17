//-----------------------------------------------------------------------
// SECTION: Email Configuration Service
// Purpose: Read/write SMTP email configuration from DB.
//          The email.service.js reads from here first, then falls back to env vars.
//-----------------------------------------------------------------------
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");
const { resetTransporter } = require("./email.service");

async function getEmailConfig() {
  const { rows } = await pool.query(
    `SELECT id, smtp_host, smtp_port, smtp_secure, email_user,
            email_pass, email_from_name, updated_at
     FROM email_config ORDER BY id DESC LIMIT 1`
  );

  if (rows.length === 0) {
    // Fall back to env vars with defaults
    return {
      smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
      smtp_port: parseInt(process.env.SMTP_PORT || "465", 10),
      smtp_secure: process.env.SMTP_SECURE !== "false",
      email_user: process.env.EMAIL_USER || "",
      email_pass: process.env.EMAIL_PASS ? "********" : "",
      email_from_name: process.env.EMAIL_FROM_NAME || "Volunteer Rewards App",
      updated_at: null,
      using_env_fallback: true,
    };
  }

  const cfg = rows[0];
  // Mask password in response
  return {
    id: cfg.id,
    smtp_host: cfg.smtp_host,
    smtp_port: cfg.smtp_port,
    smtp_secure: cfg.smtp_secure,
    email_user: cfg.email_user,
    email_pass: cfg.email_pass ? "********" : "",
    email_from_name: cfg.email_from_name,
    updated_at: cfg.updated_at,
    using_env_fallback: false,
  };
}

async function updateEmailConfig(data, userId) {
  // Validate required fields
  if (!data.smtp_host || !data.smtp_host.trim()) {
    throw createError(400, "validation_error", "SMTP host is required.");
  }
  if (!data.email_user || !data.email_user.trim()) {
    throw createError(400, "validation_error", "Email user is required.");
  }

  const smtpPort = parseInt(data.smtp_port, 10) || 465;
  const smtpSecure = data.smtp_secure !== false;

  // Get the latest row (ORDER BY id DESC ensures we don't hit a stale duplicate)
  const { rows: existing } = await pool.query("SELECT id FROM email_config ORDER BY id DESC LIMIT 1");

  if (existing.length === 0) {
    // Insert new row
    await pool.query(
      `INSERT INTO email_config (smtp_host, smtp_port, smtp_secure, email_user, email_pass, email_from_name, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [data.smtp_host.trim(), smtpPort, smtpSecure, data.email_user.trim(), data.email_pass || "", data.email_from_name || "Volunteer Rewards App", userId]
    );
  } else {
    // Update existing row
    const id = existing[0].id;

    // Only update password if a new one is provided (not masked "********")
    const passField = data.email_pass && data.email_pass !== "********"
      ? ", email_pass = $3"
      : "";

    const query = data.email_pass && data.email_pass !== "********"
      ? `UPDATE email_config SET smtp_host = $1, smtp_port = $2, email_pass = $3, smtp_secure = $4, email_user = $5, email_from_name = $6, updated_by = $7, updated_at = NOW() WHERE id = $8`
      : `UPDATE email_config SET smtp_host = $1, smtp_port = $2, smtp_secure = $3, email_user = $4, email_from_name = $5, updated_by = $6, updated_at = NOW() WHERE id = $7`;

    const params = data.email_pass && data.email_pass !== "********"
      ? [data.smtp_host.trim(), smtpPort, data.email_pass, smtpSecure, data.email_user.trim(), data.email_from_name || "Volunteer Rewards App", userId, id]
      : [data.smtp_host.trim(), smtpPort, smtpSecure, data.email_user.trim(), data.email_from_name || "Volunteer Rewards App", userId, id];

    await pool.query(query, params);
  }

  // Reset the email transporter so it picks up the new config
  resetTransporter();

  return { message: "Email configuration updated successfully. New settings are active immediately." };
}

async function testEmailConfig(email, adminUser) {
  if (!email || !email.trim()) {
    throw createError(400, "validation_error", "Test email address is required.");
  }

  // Force reset transporter so it picks up latest DB config
  resetTransporter();

  const { sendEmail } = require("./email.service");

  await sendEmail({
    to: email.trim(),
    subject: "Test email from Volunteering Rewards App",
    text: `Hi there,\n\nThis is a test email from the Volunteering Rewards App admin panel.\n\nIf you received this, your SMTP configuration is working correctly!\n\n— Admin (${adminUser?.name || "System"})`,
    html: `
      <h2>Test Email</h2>
      <p>Hi there,</p>
      <p>This is a test email from the <strong>Volunteering Rewards App</strong> admin panel.</p>
      <p>If you received this, your SMTP configuration is working correctly! 🎉</p>
      <hr />
      <p style="color: #666; font-size: 12px;">— Admin (${adminUser?.name || "System"})</p>`,
  });

  return { message: "Test email sent successfully. Check your inbox." };
}

module.exports = { getEmailConfig, updateEmailConfig, testEmailConfig };
