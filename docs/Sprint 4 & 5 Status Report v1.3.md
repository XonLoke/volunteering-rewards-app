# Sprint 4 & 5 Status Report

**Version:** 1.3  
**Date:** 19 June 2026  
**Project:** Volunteering Rewards App (C3000C)  
**Sprint 4:** 15 Jun – 29 Jun 2026 — Comprehensive Testing + Additional Features  
**Sprint 5:** 29 Jun – 6 Jul 2026 — Deployment & Delivery  
**Status:** SPRINT 4 CORE DELIVERED ✅ (13 days early). SPRINT 5 DEPLOYMENT COMPLETE ✅. Team testing and documentation remain.

---

## 1. Executive Summary

All core technical work for Sprint 4 and Sprint 5 has been completed by Xon (Project Coordinator). The application is fully deployed across three cloud platforms, all four portals are functional, and all four additional features (F1-F4) are built and integrated. A Jira audit was conducted on 19 Jun 2026 confirming 48 of 100 issues completed. Remaining work consists of team member testing assignments (Grace, Vivian) and documentation (Nurain).

**Key achievement:** Sprint 4 core deliverables were completed by 16 Jun — 13 days ahead of the 29 Jun deadline.

---

## 2. Deployed Portals

All portals are live and verified working (tested 19 Jun 2026):

| Portal | URL | Login | Status |
|--------|-----|-------|--------|
| **Backend API** | [vol-rewards-api.onrender.com](https://vol-rewards-api.onrender.com) | — | ✅ Live |
| **API Health** | [vol-rewards-api.onrender.com/api/health](https://vol-rewards-api.onrender.com/api/health) | — | ✅ 200 OK |
| **Admin Portal** | [webportals-lovat.vercel.app/admin/login](https://webportals-lovat.vercel.app/admin/login) | carol@test.com | ✅ With login + role gate |
| **Organiser Portal** | [webportals-lovat.vercel.app/organiser/login](https://webportals-lovat.vercel.app/organiser/login) | bob@test.com | ✅ With login + auth redirect |
| **Merchant Portal** | [webportals-lovat.vercel.app/merchant](https://webportals-lovat.vercel.app/merchant) | cheryl@test.com | ✅ With login |
| **Scanner PWA** | [webportals-lovat.vercel.app/scan](https://webportals-lovat.vercel.app/scan) | bob@test.com | ✅ With login |
| **Volunteer PWA** | [dist-orpin-nine-46.vercel.app](https://dist-orpin-nine-46.vercel.app) | alice@test.com | ✅ With PWA manifest + service worker |

### Portal Access Matrix

| Persona | Admin Portal | Organiser Portal | Merchant Portal | Scanner PWA | Volunteer PWA |
|---------|:-----------:|:---------------:|:--------------:|:----------:|:------------:|
| Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Organiser | ❌ | ✅ | ❌ | ✅ | ❌ |
| Merchant | ❌ | ❌ | ✅ | ❌ | ❌ |
| Volunteer | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Infrastructure

| Service | Component | Plan | Cost |
|---------|-----------|------|------|
| **Render** | Backend API (Node.js/Express, Docker) | Free Hobby | $0/mo |
| **Neon** | PostgreSQL 16 Database (serverless, no expiry) | Free Tier | $0/mo |
| **Vercel** | Frontend Web Portals + PWAs (global CDN) | Free Hobby | $0/mo |
| **Total** | | | **$0.00/mo** |

### Architecture Diagram

```
┌─────────────────┐     HTTPS requests      ┌─────────────────┐
│   Vercel        │ ──────────────────────▶ │   Render        │
│   (Frontend)    │ ◀────────────────────── │   (Backend)     │
│   React/Vite    │     JSON responses      │   Node/Express  │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                                    │ PostgreSQL (SSL)
                                                    ▼
                                            ┌─────────────────┐
                                            │   Neon          │
                                            │   (Database)    │
                                            │   PostgreSQL 16 │
                                            └─────────────────┘
```

### Cold Start Notice
Render's free tier spins down after 15 minutes of inactivity. First request after idle takes 30–60 seconds to wake up. Refresh after waiting.

---

## 4. Completed Work — All Technical Tasks Done ✅

### Backend Development
| Task | Sprint | Date |
