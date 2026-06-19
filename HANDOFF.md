# Handoff: Fix Merchant URLs in README & Docs — Commit and Verify

**Handoff ID:** HO-20260619-009
**Date:** 19 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

Multiple documentation files incorrectly listed the Merchant portal URL as `https://webportals-lovat.vercel.app/merchant/login` when the actual route is `https://webportals-lovat.vercel.app/merchant`. The README URLs have already been made clickable. The git repo has stale lock files and needs a force push.

---

## ✅ What's Already Done

- README.md — URLs made clickable, Merchant URL corrected ✅
- `docs/Deployment Architecture Report v1.1.md` — Merchant URL fixed ✅
- `docs/Deployment Checklist v1.0.md` — Merchant URL fixed ✅
- `docs/Online Test Access Points v1.0.md` — Merchant URL fixed ✅
- `docs/Sprint 4 & 5 Status Report v1.0.md` — Merchant URL fixed ✅
- `docs/Sprint 4 & 5 Status Report v1.2.md` — Merchant URL fixed ✅

---

## 🎯 Task 1: Commit and Push to GitHub

The git repo has stale lock files. Run these commands in order:

```powershell
cd D:\c3000c\volunteering-rewards-app

# Clear stale lock files
del .git\HEAD.lock
del .git\index.lock

# Stage and commit
git add README.md docs/ -A
git commit -m "docs: fix merchant URLs, make README URLs clickable"

# Pull remote changes first
git pull --rebase origin main

# Push
git push origin main
```

---

## 🎯 Task 2: Verify All Portal URLs

After the push, verify each portal URL works by loading it in a browser or via curl:

| Portal | URL to Verify | Expected Result |
|--------|--------------|-----------------|
| Admin Login | `https://webportals-lovat.vercel.app/admin/login` | ✅ Login form loads |
| Organiser | `https://webportals-lovat.vercel.app/organiser` | ✅ Redirects to login if not authenticated |
| Organiser Login | `https://webportals-lovat.vercel.app/organiser/login` | ✅ Login form loads |
| Merchant | `https://webportals-lovat.vercel.app/merchant` | ✅ Login form loads (NOT /merchant/login) |
| Scanner | `https://webportals-lovat.vercel.app/scan` | ✅ Login form loads |
| Volunteer PWA | `https://dist-orpin-nine-46.vercel.app` | ✅ App loads |
| Volunteer Home | `https://dist-orpin-nine-46.vercel.app/home` | ✅ App loads (no 404) |
| API Health | `https://vol-rewards-api.onrender.com/api/health` | ✅ Returns 200 JSON |
| API Login | `POST https://vol-rewards-api.onrender.com/api/auth/login` with carol@test.com | ✅ Returns JWT |

Run verification from the VM:

```bash
# Quick curl check for each URL
for url in \
  "https://webportals-lovat.vercel.app/admin/login" \
  "https://webportals-lovat.vercel.app/organiser" \
  "https://webportals-lovat.vercel.app/organiser/login" \
  "https://webportals-lovat.vercel.app/merchant" \
  "https://webportals-lovat.vercel.app/scan" \
  "https://dist-orpin-nine-46.vercel.app" \
  "https://vol-rewards-api.onrender.com/api/health"
do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$status $url"
done
```

---

## Acceptance Criteria

- [ ] All changes committed and pushed to GitHub
- [ ] No stale git lock files
- [ ] Merchant URL loads at `/merchant` (not `/merchant/login`)
- [ ] All 9 portal URLs verified working

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Fix Merchant URLs in all docs | ✅ Done | 6 files updated |
| Make README URLs clickable | ✅ Done | |
| Commit and push to GitHub | ⬜ Pending | Stale lock files need clearing |
| Verify all portal URLs | ⬜ Pending | 9 URLs to check |
| Update HANDOFF.md | ⬜ Pending | When done |
