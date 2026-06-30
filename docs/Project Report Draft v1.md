# Volunteering Rewards App

**C300 Project Report — Draft v1**

| | |
|---|---|
| **Project ID** | <Project ID> |
| **Date of Submission** | DD-MMM-YYYY |
| **Submitted By** | <Team ID> |

| Name | Admission No. | Role |
|---|---|---|
| Xon Loke | | Lead Developer / Backend & Admin Portal |
| Vivian | | Mobile App |
| Grace | | Integration & Testing |
| Nurain | | Documentation & UAT |

---

## ACKNOWLEDGEMENTS

We would like to express our sincere gratitude to our supervisor, Mr/Ms <Supervisor Name>, for their invaluable guidance and support throughout this project. Their feedback during our regular meetings helped shape the direction of our work and ensured we stayed on track.

We also thank Republic Polytechnic for providing the resources and learning environment that made this project possible.

Finally, we appreciate the cooperation and contributions of all team members who worked diligently to complete this project within the stipulated timeline.

---

## TABLE OF CONTENTS

ACKNOWLEDGEMENTS
ABSTRACT
1 Introduction
2 Project Specification and Plan
    2.1 Project Overview
    2.2 Functional Requirements
    2.3 Project Plan
3 Business Analysis
    3.1 Business Issues
    3.2 Market Analysis
    3.3 Business Solutions
4 System Design and Implementation
    4.1 System Architecture
    4.2 Detailed System Design
5 System Testing
6 User and Technical Documentations
    6.1 User Documentation/Guide/Manual
    6.2 Technical Documentation
7 Conclusions
References
Appendices
Project Poster

---

## ABSTRACT

The Volunteering Rewards App is a web and mobile application designed to encourage Singaporeans to participate in volunteering activities by rewarding their efforts with points that can be redeemed for coupons. Volunteers earn points by scanning QR codes after completing volunteering activities. When sufficient points are accumulated, they can redeem these points for coupons from participating merchant outlets.

The system comprises four main user portals: a volunteer mobile app for browsing events, checking in via QR codes, and redeeming rewards; an organiser web and mobile app for managing events and scanning attendance; an admin web portal for overseeing users, organisers, merchants, and the rewards system; and a merchant cashier app for verifying and redeeming coupons.

The backend is built with Express.js and PostgreSQL, while the frontend uses React (Vite) for web portals and Expo (React Native) for the mobile app. The system was developed using a vertical slice approach across five sprints, with each team member owning features end-to-end from database to user interface.

Key accomplishments include a fully functional admin portal with real-time dashboard metrics, user and organiser management, merchant registration, coupon batch creation with PIN generation, and password reset functionality. The system uses JWT authentication with automatic token refresh and role-based access control to ensure security.

---

## 1 Introduction

### 1.1 Background

Volunteering plays a vital role in Singapore's community development. However, encouraging sustained volunteer participation remains a challenge. Many potential volunteers are motivated by recognition and rewards, yet existing systems lack an integrated approach to track participation, award points, and provide redeemable rewards through merchant partnerships.

### 1.2 Problem Statement

Current volunteer management systems in Singapore typically handle event scheduling and attendance tracking separately from reward distribution. Volunteers have no unified platform to discover events, track their participation history, earn points, and redeem rewards. Organisers struggle to manage attendance and feedback efficiently. There is no streamlined process for merchants to sponsor goods and services as volunteer incentives.

### 1.3 Project Objectives

- Develop a mobile application for volunteers to browse events, register participation, check in via QR codes, earn points, and redeem rewards.
- Create a web portal for organisers to register with official documents, manage events, and review feedback.
- Build an admin web portal to manage users, organisers, merchants, coupons, and system configuration.
- Implement a merchant cashier app for coupon PIN verification and redemption.
- Establish a points-based reward system with merchant sponsorship model.

### 1.4 Project Scope

The project covers full-stack development including a backend API with 14 database tables and over 45 REST endpoints, a volunteer mobile app with 10+ screens built in Expo/React Native, an admin web portal with 12 pages, an organiser web portal with 8 pages, a merchant cashier PWA for PIN verification, and an organiser scanning PWA for QR attendance.

---

## 2 Project Specification and Plan

### 2.1 Project Overview

The Volunteering Rewards App is developed using a vertical slice architecture where each team member owns complete features from database to user interface. This approach ensures every member has full-stack contribution evidence and prevents integration bottlenecks.

**Technology Stack:**

- Backend: Node.js with Express.js, PostgreSQL, JWT authentication
- Web Frontend: React with Vite, react-router-dom
- Mobile App: Expo (React Native) with expo-router
- Infrastructure: Docker, GitHub Actions CI/CD

### 2.2 Functional Requirements

The system supports four main user roles with the following key functions:

**Volunteer Mobile App:**
Event browsing, registration, QR check-in, points earning, feedback and suggestions submission, reward redemption with 6-digit PIN, profile management and points history.

**Organiser Web & Mobile App:**
Organisation registration with document upload, event CRUD with scheduling and points assignment, attendance tracking via QR scanning, feedback review and response, statistics charts.

**Admin Web App:**
User, organiser, and merchant management, coupon batch creation with PIN generation, dashboard with real-time metrics and no-show alerts, password reset and account management.

**Merchant Cashier App:**
6-digit PIN verification, coupon redemption confirmation, redemption history.

### 2.3 Project Plan

The project was developed across five sprints from 7 May to 6 July 2026:

- **Sprint 1 (7-18 May):** Foundation + Auth Backend — Express server, PostgreSQL (14 tables), JWT auth, middleware, seed data.
- **Sprint 2 (18 May - 1 Jun):** Backend Implementation — Each member implements their slice's backend + wires frontend screens.
- **Sprint 3 (1 Jun - 15 Jun):** Frontend Completion + Integration — Remaining screens and end-to-end workflows.
- **Sprint 4 (15 Jun - 29 Jun):** Hardening — Testing >70% coverage, security audit, bug fixes.
- **Sprint 5 (29 Jun - 6 Jul):** Delivery — Final polish, presentation, user manual, deployment.

**Team Member Responsibilities:**

| Member | Role | Key Responsibilities |
|---|---|---|
| Xon | Lead Developer | Backend, Admin Portal, CI/CD, APK Build, PWA-APK Unification |
| Vivian | Mobile Developer | Volunteer Mobile App screens, Security Testing, APK Testing |
| Grace | Integrator | Integration Testing, API Testing, UAT Coordination |
| Nurain | Documenter | Project Report, User Manual, Presentation Slides, UAT, APK Testing |

*(Full Gantt chart to be inserted)*

---

## 3 Business Analysis

### 3.1 Business Issues

Volunteerism in Singapore faces several challenges. There is low sustained participation as many volunteers participate once but do not return due to lack of recognition. Current systems are fragmented, with event registration, attendance tracking, and reward distribution handled by separate platforms. Organisers rely on paper-based attendance and manual reward distribution. There is no streamlined way for merchants to contribute rewards and sponsorships.

### 3.2 Market Analysis

Singapore has a strong volunteerism culture supported by the National Volunteer and Philanthropy Centre (NVPC). The SG Cares movement and various community initiatives create ongoing demand for volunteer management solutions. Competitors include existing volunteer management platforms, but few integrate rewards through merchant sponsorship.

### 3.3 Business Solutions

The Volunteering Rewards App addresses these issues through:

- **Gamification through points:** Volunteers earn points for each completed activity, providing tangible recognition.
- **Unified platform:** Event discovery, registration, attendance, and rewards in one place.
- **QR-based automation:** Eliminates manual attendance taking.
- **Merchant sponsorship model:** Businesses can sponsor goods and services as rewards, creating a sustainable ecosystem.

**Process Flow:**

- **Volunteer:** Browses events → Registers → Attends → Scans QR → Earns points → Redeems rewards
- **Organiser:** Registers with docs → Gets approved → Creates events → Scans attendance → Reviews feedback
- **Admin:** Manages users → Approves organisers → Registers merchants → Creates coupons → Monitors system
- **Merchant:** Receives PIN → Verifies → Confirms redemption → Views history

---

## 4 System Design and Implementation

### 4.1 System Architecture

The system follows a client-server architecture with multiple frontends connecting to a single Express.js API backend. The mobile app (Expo/React Native) and web portals (React + Vite) communicate with the backend via HTTP/JSON REST API. The backend connects to a PostgreSQL database using parameterized queries through the pg library.

**Key Architectural Decisions:**

- **Vertical slice pattern:** Each feature is owned end-to-end by one team member
- **RESTful API** with standardized JSON responses and frozen API contracts
- **JWT authentication** with two-token system (15-min access + 7-day refresh) and auto-refresh
- **Role-based access control** via middleware-enforced permissions per endpoint
- **Parameterized queries** to prevent SQL injection
- **Multi-stage Docker build** with non-root user and health check

### 4.2 Detailed System Design

**Database Schema (14 Tables):**

The database consists of 14 tables managed through versioned migration files. Core tables include roles, users, organizations, events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, coupons, user_coupons, redemption_logs, merchants, and merchant_products.

Key relationships include:
- Users belonging to roles
- Events belonging to organizations and organizers
- Volunteers registering for events through event_registrations
- Attendance tracked through attendance_logs
- Coupons linked to users via user_coupons with redemption tracked in redemption_logs

**API Endpoints (45+ total):**

| Category | Endpoints | Description |
|---|---|---|
| Auth | POST /api/auth/login, POST /api/auth/register, POST /api/auth/refresh | Authentication & token management |
| Users | GET/PUT /api/users/:id | User profile management |
| Events | GET/POST /api/events, GET/PUT/DELETE /api/events/:id | Event CRUD |
| Registrations | POST /api/events/:id/register, GET /api/registrations | Event registration |
| Attendance | POST /api/attendance/scan, GET /api/attendance/history | QR check-in |
| Rewards | GET /api/rewards, POST /api/rewards/redeem | Points & redemption |
| Coupons | GET/POST /api/coupons, PUT /api/coupons/:id | Coupon management |
| Admin | GET /api/admin/* | Admin-only operations |
| Organiser | GET/POST /api/organiser/* | Organiser operations |

*(ERD diagram, Use Case diagram, and Sequence diagrams to be inserted)*

---

## 5 System Testing

Testing was conducted throughout the development process using both automated and manual methods. A Postman collection with 20+ pre-configured API requests was used for backend testing, covering all admin endpoints and key volunteer flows.

**Manual Test Coverage (57 checkpoints):**

| Area | Test Cases | Coverage |
|---|---|---|
| App Launch | 4 tests | Splash, load, ANR, icon |
| Authentication | 5 tests | Login, register, validation, password reset |
| Home Screen | 5 tests | Content, events, points, refresh, tabs |
| Navigation | 4 tests | Bottom tabs navigation |
| Events | 4 tests | List, detail, register, view registered |
| Profile/Settings | 3 tests | Load, edit, settings |
| Performance | 5 tests | Crashes, scrolling, orientation, background, battery |
| Admin Portal | 10+ tests | Dashboard, CRUD, filters, coupon generation |
| Organiser Portal | 8+ tests | Event management, attendance scanning, feedback |
| Merchant App | 4 tests | PIN verification, redemption, history |
| Security | 5 tests | Auth bypass, injection, rate limiting, session, CORS |

*(Full test plan with pass/fail details to be inserted — see docs/Test Plan & Case Spec v2.0.md)*

---

## 6 User and Technical Documentations

### 6.1 User Documentation/Guide/Manual

**Accessing the Admin Portal:**

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend/web_portals && npm run dev`
3. Open `http://localhost:5173/admin/login` in your browser
4. Log in with the admin credentials

**Test Credentials:**

- Admin: carol@test.com / password123
- Organiser: bob@test.com / password123
- Volunteer: alice@test.com / password123

**Portal URLs:**

- Admin Login: http://localhost:5173/admin/login
- Admin Dashboard: http://localhost:5173/admin
- Organiser Portal: http://localhost:5173/organiser
- Merchant App: http://localhost:5173/merchant
- Scan App: http://localhost:5173/scan

### 6.2 Technical Documentation (Installation guide/Manual)

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
npx expo start
```

**Deployment:**

- **Docker:** `docker compose up` (builds app + PostgreSQL)
- **CI/CD:** GitHub Actions runs on push to main
- **PWA:** Deployed via Vercel at `https://dist-orpin-nine-46.vercel.app`
- **Backend API:** Hosted on Render at `https://vol-rewards-api.onrender.com`
- **Native APK:** Built locally or via GitHub Actions CI workflow

---

## 7 Conclusions

**Summary of Accomplishments:**

The Volunteering Rewards App successfully delivers a full-stack platform connecting volunteers, organisers, administrators, and merchants. The admin portal features real-time dashboard metrics, user management with search and filtering, organiser approval workflow, merchant registration with product management, and coupon creation with batch 6-digit PIN generation.

The authentication system implements JWT two-token model with automatic token refresh and role-based access control. The backend API provides over 45 endpoints across 9 route groups, all documented in frozen API contracts. The database is managed through 14 versioned migration files with parameterized queries.

Infrastructure includes a multi-stage Docker build with non-root user and health checks, a GitHub Actions CI/CD pipeline running lint and test on push, and comprehensive environment configuration templates.

**Future Work:**

- Complete service layer implementations for events, rewards, and organiser modules
- Add statistics charts on organiser dashboard
- Implement email notifications for approval and event reminders
- Develop merchant self-registration portal (Phase 2)
- Add push notifications for mobile app
- Data export functionality (CSV/PDF)
- Create real image assets for the mobile app
- Restore React Native New Architecture (newArchEnabled=true)

---

## References

*(To be added with proper citations using IEEE, APA, or MLA format)*

**Example:**
[1] D. Ingre, Survivor's Guide to Technical Writing. Mason, OH: South-Western Educational, 2003.

---

## Appendices

- **Appendix A:** Source Code (GitHub Repository)
- **Appendix B:** Postman API Collection
- **Appendix C:** Manual Testing Checklist
- **Appendix D:** Workflow Analysis Document

---

## Project Poster

*(To be created as separate PPT file)*

---

*— End of Project Report Draft v1 —*
