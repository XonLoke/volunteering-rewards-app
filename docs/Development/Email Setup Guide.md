# Email Setup Guide — Mailgun (Free Tier)

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

## Free Alternatives

| Provider | Free Tier Limits | SMTP Host |
|----------|-----------------|-----------|
| Mailgun | 100 emails/day | `smtp.mailgun.org` |
| SendGrid | 100 emails/day | `smtp.sendgrid.net` |
| SMTP2GO | 1,000 emails/month | `mail.smtp2go.com` |
| Brevo | 300 emails/day | `smtp-relay.brevo.com` |
