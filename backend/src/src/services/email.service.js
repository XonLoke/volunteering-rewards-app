const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
  }

  await transporter.sendMail({
    from: `"Volunteer Rewards App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

module.exports = {
  sendEmail,
};