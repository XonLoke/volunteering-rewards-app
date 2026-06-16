# Volunteering Rewards App — Project Report

> **Based on C300 Report Template**  
> **Draft v1 — 21 May 2026**

---

## Title Page

**Project Title:** Volunteering Rewards App  
**Project ID:** C300-XX-XXXX  
**Date of Submission:** DD-MMM-YYYY  
**Submitted By:**  
**Team ID:** <Team ID>

| Student ID | Student Name |
|-----------|-------------|
| <student_id> | Xon Loke |
| <student_id> | Vivian |
| <student_id> | Grace |
| <student_id> | Nurain |

---

## Acknowledgements

We would like to express our sincere gratitude to our supervisor, Mr/Ms <Supervisor Name>, for their invaluable guidance and support throughout this project. Their feedback during our regular meetings helped shape the direction of our work and ensured we stayed on track.

We also thank Republic Polytechnic for providing the resources and learning environment that made this project possible.

Finally, we appreciate the cooperation and contributions of all team members who worked diligently to complete this project within the stipulated timeline.

---

## Table of Contents

*(To be generated after finalization)*

---

## Abstract

The Volunteering Rewards App is a web and mobile application designed to encourage Singaporeans to participate in volunteering activities by rewarding their efforts with points that can be redeemed for coupons. Volunteers earn points by scanning QR codes after completing volunteering activities. When sufficient points are accumulated, they can redeem these points for coupons from participating merchant outlets.

The system comprises four main user portals: a volunteer mobile app for browsing events, checking in via QR codes, and redeeming rewards; an organiser web and mobile app for managing events and scanning attendance; an admin web portal for overseeing users, organisers, merchants, and the rewards system; and a merchant cashier app for verifying and redeeming coupons.

The backend is built with Express.js and PostgreSQL, while the frontend uses React (Vite) for web portals and Expo (React Native) for the mobile app. The system was developed using a vertical slice approach across five sprints, with each team member owning features end-to-end from database to user interface.

Key accomplishments include a fully functional admin portal with real-time dashboard metrics, user and organiser management, merchant registration, coupon batch creation with PIN generation, and password reset functionality. The system uses JWT authentication with automatic token refresh and role-based access control to ensure security.

---

## 1. Introduction

### 1.1 Background

Volunteering plays a vital role in Singapore's community development. However, encouraging sustained volunteer participation remains a challenge. Many potential volunteers are motivated by recognition and rewards, yet existing systems lack an integrated approach to track participation, award points, and provide redeemable rewards through merchant partnerships.

### 1.2 Problem Statement

Current volunteer management systems in Singapore typically handle event scheduling and attendance tracking separately from reward distribution. Volunteers have no unified platform to discover events, track their participation history, earn points, and redeem rewards. Organisers struggle to manage attendance and feedback efficiently. There is no streamlined process for merchants to sponsor goods and services as volunteer incentives.

### 1.3 Project Objectives

- Develop a mobile application for volunteers to browse events, register participation, check in via QR codes, earn points, and redeem rewards
- Create a web portal for organisers to register with official documents, manage events, and review feedback
- Build an admin web portal to manage users, organisers, merchants, coupons, and system configuration
- Implement a merchant cashier app for coupon PIN verification and redemption
- Establish a points-based reward system with merchant sponsorship model

### 1.4 Project Scope

The project covers full-stack development including:
- Backend API with 14 database tables and 45+ REST endpoints
- Volunteer mobile app (Expo/React Native) with 10+ screens
- Admin web portal (React/Vite) with 12 pages
- Organiser web portal with 8 pages
- Merchant cashier PWA with PIN verification flow
- Organiser scanning PWA for QR attendance

---

## 2. Project Specification and Plan

### 2.1 Project Overview

The Volunteering Rewards App is developed using a **vertical slice architecture** where each team member owns complete features from database to user interface. This approach ensures every member has full-stack contribution evidence and prevents integration bottlenecks.

**Technology Stack:**
- **Backend:** Node.js with Express.js, PostgreSQL, JWT authentication
- **Web Frontend:** React with Vite, react-router-dom
- **Mobile App:** Expo (React Native) with expo-router
- **Infrastructure:** Docker, GitHub Actions CI/CD

### 2.2 Functional Requirements

*(See Software Functional List.md for complete breakdown)*

**Volunteer Mobile App:**
- Event browsing, registration, QR check-in, points earning
- Feedback and suggestions submission
- Reward redemption with 6-digit PIN
- Profile management and points history

**Organiser Web & Mobile App:**
- Organisation registration with document upload
- Event CRUD with scheduling and points assignment
- Attendance tracking via QR scanning
- Feedback review and response

**Admin Web App:**
- User, organiser, and merchant management
- Coupon batch creation with PIN generation
- Dashboard with real-time metrics and no-show alerts
- Password reset and account management

**Merchant Cashier App:**
- 6-digit PIN verification
- Coupon redemption confirmation
- Redemption history

### 2.3 Project Plan

**Sprint Schedule (7 May – 6 Jul 2026):**

| Sprint | Dates | Focus |
|--------|-------|-------|
| Sprint 1 | 7–18 May | Foundation + Auth Backend |
| Sprint 2 | 18 May – 1 Jun | Backend Implementation (per slice) |
| Sprint 3 | 1 Jun – 15 Jun | Frontend Completion + Integration |
| Sprint 4 | 15 Jun – 29 Jun | Hardening (testing, security, bug fixes) |
| Sprint 5 | 29 Jun – 6 Jul | Delivery (polish, presentation, deployment) |

**Team Member Responsibilities:**

| Member | Backend Ownership | Frontend Ownership |
|--------|------------------|-------------------|
| **Xon** | Auth, shared middleware, admin service, CI/CD, Docker | Admin portal (login, dashboard, users, organisers, merchants), reset password |
| **Vivian** | Events, attendance, favorites services | Mobile event screens, QR scanning app, statistics charts |
| **Grace** | Rewards, merchant services | Mobile rewards catalog, merchant PIN app, coupons/redemptions |
| **Nurain** | Admin, organiser, me services | Organiser portal, admin events/QR pages |

*(Full Gantt chart to be inserted)*

---

## 3. Business Analysis

### 3.1 Business Issues

Volunteerism in Singapore faces several challenges:
- **Low sustained participation:** Many volunteers participate once but do not return due to lack of recognition
- **Fragmented systems:** Event registration, attendance tracking, and reward distribution are handled by separate platforms
- **Manual processes:** Organisers rely on paper-based attendance and manual reward distribution
- **Limited merchant integration:** No streamlined way for merchants to contribute rewards and sponsorships

### 3.2 Market Analysis

Singapore has a strong volunteerism culture supported by the National Volunteer and Philanthropy Centre (NVPC). The SG Cares movement and various community initiatives create ongoing demand for volunteer management solutions. Competitors include existing volunteer management platforms, but few integrate rewards through merchant sponsorship.

### 3.3 Business Solutions

The Volunteering Rewards App addresses these issues by:
- **Gamification through points:** Volunteers earn points for each completed activity, providing tangible recognition
- **Unified platform:** One app for event discovery, registration, attendance, and rewards
- **QR-based automation:** Eliminates manual attendance taking through QR code scanning
- **Merchant sponsorship model:** Businesses sponsor goods/services as rewards, creating a sustainable ecosystem
- **Multi-role support:** Separate interfaces for volunteers, organisers, admins, and merchants ensure each user type has appropriate functionality

**Process Flow:**
```
Volunteer → Browses events → Registers → Attends → Scans QR → Earns points → Redeems rewards
Organiser → Registers with docs → Gets approved → Creates events → Scans attendance → Reviews feedback
Admin → Manages users → Approves organisers → Registers merchants → Creates coupons → Monitors system
Merchant → Receives PIN → Verifies → Confirms redemption → Views history
```

---

## 4. System Design and Implementation

### 4.1 System Architecture

```
Mobile App (Expo/React Native)         Web Portals (React + Vite)
         |                                       |
    (HTTP/JSON)                             (HTTP/JSON)
         |                                       |
         └──────────┬────────────────────────────┘
                    │
            Express.js API
            (backend/, port 3000)
                    │
            PostgreSQL Database
            (14 tables)
```

**Key Architectural Decisions:**
- **Vertical slice pattern:** Each feature is owned end-to-end by one team member
- **RESTful API:** Standardized JSON responses with frozen API contracts
- **JWT authentication:** Two-token system (15-min access + 7-day refresh) with auto-refresh
- **Role-based access control:** Middleware-enforced permissions per endpoint
- **Parameterized queries:** All database queries use parameterized placeholders to prevent SQL injection

### 4.2 Detailed System Design

**Database Schema (14 Tables):**

```
roles ──< users ──> user_coupons ──< coupons
  |          |            |              |
  |          |       redemption_logs     |
  |          |                           |
  |     organizations ──> events ──> event_registrations ──> attendance_logs
  |                               |
  |                          event_feedback
  |                          event_qna
  |                          favorites
  |
  merchants ──< merchant_products
```

**Key API Endpoints (45+ total):**

| Module | Endpoints | Owner |
|--------|-----------|-------|
| Auth | register, login, refresh, profile, registerOrganiser | Xon |
| Admin | dashboard, users CRUD, organisers approve, events, coupons, merchants, redemptions, config | Xon |
| Events | browse, detail, categories, register, leave, feedback, Q&A, roster, stats | Vivian |
| Attendance | scan, batch | Vivian |
| Rewards | browse, detail, redeem | Grace |
| Merchant | verify PIN, redeem, reverse, history | Grace |
| Organiser | dashboard, event CRUD, roster, feedback, Q&A | Nurain |
| Me | myEvents, myPoints, myCoupons, myQrCode, myFavorites | Nurain |

*(ERD diagram, Use Case diagram, and Sequence diagrams to be inserted)*

---

## 5. System Testing

Testing was conducted throughout the development process using both automated and manual methods.

**Testing Levels:**

| Level | Scope | Tools |
|-------|-------|-------|
| Unit Testing | Individual service functions | Jest (planned Sprint 4) |
| Integration Testing | API endpoint responses | Postman collection |
| System Testing | End-to-end workflows | Manual + Postman |
| Acceptance Testing | Supervisor demo sessions | Live walkthrough |

**Manual Test Coverage (57 checkpoints):**

| Test Area | Owner | Checks |
|-----------|-------|--------|
| Auth API | Xon | 9 |
| Events API | Vivian | 3 |
| Rewards API | Grace | 2 |
| Admin Portal | Xon | 17 |
| Organiser Portal | Nurain | 8 |
| Merchant Portal | Grace | 3 |
| Scan App | Vivian | 4 |
| Mobile App | Vivian | 8 |
| Error States | Everyone | 3 |

*(Full test plan with pass/fail results to be inserted)*

---

## 6. User and Technical Documentations

### 6.1 User Documentation/Guide

**Accessing the Admin Portal:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend/web_portals && npm run dev`
3. Open `http://localhost:5173/admin/login`
4. Login: `carol@test.com` / `password123`

**Portal URLs:**

| Portal | URL |
|--------|-----|
| Admin Login | http://localhost:5173/admin/login |
| Admin Dashboard | http://localhost:5173/admin |
| Organiser Portal | http://localhost:5173/organiser |
| Merchant App | http://localhost:5173/merchant |
| Scan App | http://localhost:5173/scan |

### 6.2 Technical Documentation

**Backend Setup:**
```bash
git clone https://github.com/XonLoke/volunteering-rewards-app.git
cd backend
cp .env.example .env  # Edit with your DB credentials
npm install
npm run migrate       # Creates all 14 tables
npm run seed          # Seeds test data
npm run dev           # Starts on port 3000
```

**Frontend Setup:**
```bash
cd frontend/web_portals
npm install
npm run dev           # Starts on port 5173
```

**Mobile App Setup:**
```bash
cd frontend/mobile_app
npm install
npx expo start        # Opens Expo Go
```

**Deployment:**
- Docker: `docker compose up` (builds app + PostgreSQL)
- CI/CD: GitHub Actions runs on push to main (lint → test → deploy placeholder)

---

## 7. Conclusions

### Summary of Accomplishments

The Volunteering Rewards App successfully delivers a full-stack platform connecting volunteers, organisers, administrators, and merchants. Key accomplishments include:

- **Fully functional admin portal** with real-time dashboard, user management, organiser approval workflow, merchant registration, and coupon creation with batch PIN generation
- **Robust authentication system** with JWT two-token model, role-based access control, auto token refresh, and rate limiting
- **14 database tables** with parameterized queries and migration versioning
- **CI/CD pipeline** with automated linting and testing on push
- **Docker containerization** with multi-stage build and health checks
- **Comprehensive API coverage** with 45+ endpoints matching frozen contracts

### Future Work

- Complete service layer implementations for events, rewards, and organiser modules
- Statistics charts on organiser dashboard
- Email notifications for approval and event reminders
- Merchant self-registration portal (Phase 2)
- Push notifications for mobile app
- Data export functionality (CSV/PDF)

---

## References

*(To be added with proper citations)*

---

## Appendices

**Appendix A:** Source Code (GitHub Repository)  
**Appendix B:** Postman API Collection  
**Appendix C:** Manual Testing Checklist  
**Appendix D:** Workflow Analysis Document  

---

## Project Poster

*(To be created as separate PPT file)*
