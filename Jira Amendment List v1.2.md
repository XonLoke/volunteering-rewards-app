# Jira Amendment List — For Hermes

**Version:** 1.2  
**Date:** 8 June 2026 (Updated — Added Hall of Fame)  
**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/list  

---

## Instructions for Hermes

Please update the Jira board as follows:

---

## 1. Mark These as Done (Sprint 3 Completed)

| Key | Summary | Notes |
|-----|---------|-------|
| KAN-? | Coupon Real-Time Value Calculation | Formula fixed, field mapping fixed, frontend display updated |
| KAN-? | Coupon PIN View Modal | PINs button now shows full PIN list modal |
| KAN-? | Redemption History Overhaul | Sortable columns, date filter, user links, 7 per page |
| KAN-? | Coupon Value Snapshot at Redemption | value_cents frozen in redemption_logs, not affected by config changes |
| KAN-? | Organiser Contact Email Fix | Field alias bug in admin.service.js fixed |
| KAN-? | Merge Vivian's Branch | origin/vivian → main merged successfully |
| KAN-? | Unit Tests (11 tests) | auth, admin, merchant service tests — all passing |
| KAN-? | Test Plan Document | 92 test cases across 6 test types, report-ready |
| KAN-? | Testing Guide for Team | Step-by-step per team member |
| KAN-? | Sprint v7 Schedule | Updated to reflect final sprint plan |

---

## 2. Update These Sprint 3 Tasks (Partial Completion)

### Vivian

| Key | Summary | New Status | Note |
|-----|---------|-----------|------|
| KAN-13 | Wire mobile event screens | **In Progress** | Partial — screens built, not fully verified |
| KAN-14 | Wire QR scanning screen | **Done** ✅ | Volunteer QR display works (app/scan.tsx) |
| KAN-15 | Wire rewards screens | **In Progress** | Partial — screens + latest commits, not fully verified |
| KAN-16 | On-site controller PWA | **Move to Sprint 4** | → Create new ticket KAN-97 QR-PWA. Only mockup exists, needs camera scan |
| KAN-17 | Statistics charts | **Not Done** → Move to backlog | No implementation yet |
| KAN-18 | Test all mobile screens | **Move to Sprint 4** | Testing is now Sprint 4 team activity |

### Grace

| Key | Summary | New Status | Note |
|-----|---------|-----------|------|
| KAN-19 | Wire merchant PWA | **In Progress** | UI built (833+544 lines) but API wiring not fully verified |
| KAN-20 | Wire admin coupons | **Done** ✅ | Actually done by Xon (Coupons.jsx fully wired) |
| KAN-21 | Wire admin redemptions | **Done** ✅ | Actually done by Xon (Redemptions.jsx fully wired) |
| KAN-22 | Wire rewards catalog | **In Progress** | Backend done, mobile screens exist |
| KAN-23 | Online vs in-store claim | **Not Done** → Close | Won't implement — no merchant self-registration planned |
| KAN-24 | Merchant sponsorship model | **Not Done** → Close | Won't implement — merchant tables deferred |

### Nurain

| Key | Summary | New Status | Note |
|-----|---------|-----------|------|
| KAN-25~31 | All organiser/volunteer service + portal wiring | **All Done** ✅ | Code already in main, git diff shows no differences |

---

## 3. Create New Tickets for Sprint 4 (Testing)

| Priority | Summary | Assignee | Sprint |
|----------|---------|----------|--------|
| 🔴 High | Execute Integration Tests (34 tests) | Grace + Xon | Sprint 4 |
| 🔴 High | Execute System Tests (6 tests) | Whole Team | Sprint 4 |
| 🔴 High | Execute User Acceptance Tests (8 tests) | Whole Team | Sprint 4 |
| 🔴 High | Execute Security Tests (12 tests) | Vivian + Xon | Sprint 4 |
| 🔴 High | Execute Performance Tests (8 tests) | Xon | Sprint 4 |
| 🟡 Medium | Complete Organiser QR Scanner PWA (KAN-97) | Vivian (or v-Vivian) | Sprint 4 |
| 🟡 Medium | Complete Cashier PIN PWA | Grace (or v-Grace) | Sprint 4 |

---

## 4. Create New Tickets for Sprint 4-5 (Additional Features — Xon Only)

| Priority | Summary | Assignee | Sprint | Est. Days |
|----------|---------|----------|--------|-----------|
| 🟢 Feature | Build AI Event Recommendations API + Algorithm | **Xon** | Sprint 4 | 2 days |
| 🟢 Feature | Build AI Event Recommendations Frontend UI | **Xon** | Sprint 4 | 1 day |
| 🟢 Feature | Build Hall of Fame Leaderboard (Backend + Frontend) | **Xon** | Sprint 4 | 2 days |
| 🟢 Feature | Build Volunteer Referral Program (DB migration + API) | **Xon** | Sprint 4 | 2 days |
| 🟢 Feature | Build Volunteer Referral Program (Frontend UI) | **Xon** | Sprint 5 | 2 days |
| 🟢 Feature | Build AI Feedback Summarizer (Algorithm + API) | **Xon** | Sprint 4-5 | 2 days |
| 🟢 Feature | Build AI Feedback Summarizer (Frontend UI) | **Xon** | Sprint 5 | 1 day |

**Note:** All additional features are assigned to Xon only. Team members (Vivian, Grace, Nurain) focus solely on testing and their day jobs.

---

## 5. Create New Tickets for Sprint 5 (Deployment & Delivery)

| Priority | Summary | Assignee |
|----------|---------|----------|
| 🔴 High | Backend Deployment (Render/Railway) | Xon |
| 🔴 High | Frontend Deployment (Vercel) | Grace |
| 🔴 High | Final E2E Test Pass | Grace |
| 🔴 High | Project Report (with test results + features appendix) | Nurain |
| 🔴 High | Presentation Slides + Demo Script | Nurain |
| 🔴 High | User Manual | Nurain |
| 🟡 Medium | Pre-Deployment Security Audit | Vivian |

---

## Quick Reference — Who Does What in Sprint 4-5

| Person | Sprint 4 | Sprint 5 |
|--------|----------|----------|
| **Xon** | All tests + Build 3 features (AI Recs, Referral, Summarizer) | Deploy backend + Finish feature UIs |
| **Vivian** | Security tests | Security audit |
| **Grace** | Integration tests | Deploy frontend + E2E test |
| **Nurain** | UAT tests | Report + Slides + Manual |
