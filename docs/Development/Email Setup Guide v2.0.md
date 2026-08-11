# Email Setup Guide — Mailgun (Free Tier) — v2.0

## Overview

The app uses **Mailgun** to send transactional emails:
- Verification emails on registration
- Password reset links
- Contact form submissions

Mailgun's free sandbox allows sending to **5 authorized recipients** (no credit card required).

## Current Configuration

| Setting | Value |
|---------|-------|
| Provider | Mailgun |
| Domain | `sandbox1ee88100e81b49c59a09c75a5dbb7a8f.mailgun.org` |
| API Key | Set via Admin Portal or env var |
| Method | REST API (HTTPS) — more reliable than SMTP from Render |

## Configuration Options

### Option A: Admin Portal (Recommended)

1. Log into **Admin Portal** → **Email Config** (sidebar)
2. Click a **preset** button (Mailgun, Gmail, SendGrid, etc.)
3. Fill in your SMTP credentials
4. Click **Save Settings**
5. Click **Send Test** to verify

### Option B: Environment Variables (Render Dashboard)

If Admin Portal is unreachable, set these in **Render Dashboard** → Environment:

| Variable | Value |
|----------|-------|
| `EMAIL_USER` | `postmaster@sandbox...mailgun.org` or SMTP username |
| `EMAIL_PASS` | API key or SMTP password |
| `SMTP_HOST` | `smtp.mailgun.org` (or other provider) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `FRONTEND_URL` | `https://volunteering-rewards-app.vercel.app` |

## Switching from Sandbox to Production Domain

To send to any email address (not just 5 authorized recipients):

1. Buy a domain (e.g. `volunteerrewards.app`)
2. In Mailgun → **Domains** → **Add Domain**
3. Add the DKIM/SPF DNS records to your domain registrar
4. Update the from address in **Admin Portal** → **Email Config**
5. Test with a confirmation email

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Email not received | In spam folder | Mark as "Not Spam" |
| Email not received | Sandbox not activated | Check Mailgun inbox for activation link |
| SMTP timeout | Port 587 blocked on Render | Use Mailgun REST API (already configured) |
| 500 error sending | Invalid credentials | Re-check API key in Admin Email Config |
| "Failed domain auth" warning | Sandbox without DKIM/SPF | Normal for sandbox — safe to ignore |

## 4. Contact Form — Support Email Recipient

The **Contact Us** form sends messages **TO** the support/admin email, with the user's email as `replyTo`.

### Configuration (priority order)

```js
// backend/src/routes/contact.routes.js (line ~60)
const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || "volunteerrewardsapp@gmail.com";
```

| Priority | Source | How to Set |
|----------|--------|------------|
| 1st | `SUPPORT_EMAIL` env var | Set in Render Dashboard → Environment Variables |
| 2nd | `EMAIL_USER` env var | Same env var used for SMTP auth |
| 3rd | Hardcoded fallback | Edit `backend/src/routes/contact.routes.js` |

### Mailgun Sandbox Restriction

The recipient email **must be an authorized recipient** in your Mailgun dashboard (sandbox accounts can only send to 5 pre-approved addresses):

1. Log into [Mailgun](https://app.mailgun.com) → **Sending** → **Authorized Recipients**
2. Click **Add Authorized Recipient**
3. Enter the email where contact form messages should land (e.g. `admin@yourorg.org`)
4. Confirm the verification email from Mailgun

Without this step, Mailgun will reject the email and the sender gets a 500 error.

> ⚠️ **Important:** The contact form recipient is the **admin's email** — NOT the end user who submits the form. Only this one address needs to be authorized, not every user who submits a contact message.

### Changing the Recipient

1. Add the new email to Mailgun's Authorized Recipients (see above)
2. **Option A (quick):** Set `SUPPORT_EMAIL` as a Render env var
3. **Option B (permanent):** Change the hardcoded default in `backend/src/routes/contact.routes.js`
4. Test by submitting a contact form — check `201` response includes `sentTo: your@email.com`

## Free Alternatives

| Provider | Free Tier Limits | SMTP Host |
|----------|-----------------|-----------|
| Mailgun | 100 emails/day | `smtp.mailgun.org` |
| SendGrid | 100 emails/day | `smtp.sendgrid.net` |
| SMTP2GO | 1,000 emails/month | `mail.smtp2go.com` |
| Brevo | 300 emails/day | `smtp-relay.brevo.com` |
