# VR Organizer Backend

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## PostgreSQL
Create database `volunteer_reward`, then run `schema.sql`.

## Main APIs
- GET /api/organiser/dashboard
- GET /api/organiser/events
- POST /api/organiser/events
- PUT /api/organiser/events/:eventId
- GET /api/organiser/events/:eventId/roster
- POST /api/organiser/events/:eventId/check-in
- GET /api/organiser/feedback
- GET /api/me/profile
- GET /api/me/events
- GET /api/me/points
- GET /api/me/coupons
- GET /api/me/qr-code
