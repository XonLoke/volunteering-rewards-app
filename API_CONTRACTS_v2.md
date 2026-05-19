# API Contracts — Volunteering Rewards App (v2)

> **Purpose:** Complete request/response contracts for every API endpoint across all 4 apps.
> **Version:** 2 (19 May 2026) — Added missing register/organiser endpoint, wired events + rewards routes, added /stats endpoint.
> **Status:** Frozen (do not modify without updating this document)
> **Auth:** All endpoints except `/api/auth/*` require `Authorization: Bearer <token>` header.

---

## Table of Contents

1. [General Conventions](#general-conventions)
2. [Auth (All Apps)](#auth-all-apps)
3. [Volunteer Mobile App](#volunteer-mobile-app)
4. [Organiser Web Portal](#organiser-web-portal)
5. [Organiser Scanning App](#organiser-scanning-app)
6. [Admin Web Portal](#admin-web-portal)
7. [Merchant Redemption App](#merchant-redemption-app)

---

## General Conventions

### Base URL
```
https://api.volunteeringrewards.com/v1
```

### Date Format
All timestamps are ISO 8601: `2026-05-15T09:41:00+08:00`

### Pagination
List endpoints accept: `?page=1&limit=20`
Return:
```json
{
  "data": [...],
  "total": 142,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

### Error Response Shape
```json
{
  "error": {
    "code": "error_code_string",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role / disabled account) |
| 404 | Not found |
| 409 | Conflict (e.g. already registered) |
| 429 | Rate limited |
| 500 | Server error |

---

## Auth (All Apps)

### POST /api/auth/register

Register a new volunteer account.

```
Role required: None
Rate limit: 5 req/min per IP
```

**Request:**
```json
{
  "name": "John Tan",
  "email": "john@example.com",
  "phone": "+6581234567",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Tan",
    "email": "john@example.com",
    "phone": "+6581234567",
    "role": "volunteer",
    "points_balance": 0,
    "created_at": "2026-05-15T09:41:00+08:00"
  },
  "token": "jwt_token_string"
}
```

**Errors:** `validation_error`, `email_taken`, `phone_taken`

---

### POST /api/auth/register/organiser

Register a new organiser account (requires organisation details).

```
Role required: None
Rate limit: 5 req/min per IP
```

**Request:**
```json
{
  "name": "Jane Lim",
  "email": "jane@nparks.gov.sg",
  "phone": "+6581234567",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "organisation_name": "National Parks Board",
  "organisation_type": "statutory_board",
  "organisation_docs": ["upload_id_url", "upload_letter_url"]
}
```

**Response 201:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Jane Lim",
    "email": "jane@nparks.gov.sg",
    "phone": "+6581234567",
    "role": "organiser",
    "organisation": {
      "id": "uuid",
      "name": "National Parks Board",
      "type": "statutory_board",
      "status": "pending_approval"
    },
    "created_at": "2026-05-15T09:41:00+08:00"
  },
  "token": "jwt_token_string"
}
```

**Errors:** `validation_error`, `email_taken`, `phone_taken`, `invalid_document`

---

### POST /api/auth/login

Login for all roles (volunteer, organiser, admin, merchant).

```
Role required: None
Rate limit: 10 req/min per IP
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Tan",
    "email": "john@example.com",
    "role": "volunteer",
    "points_balance": 2450,
    "avatar_url": null
  },
  "token": "jwt_token_string",
  "expires_at": "2026-05-16T09:41:00+08:00"
}
```

**Errors:** `invalid_credentials`, `account_disabled`

---

### POST /api/auth/refresh

Issue a new access token using a valid refresh token (rotation).

```
Role required: None
```

**Request:**
```json
{
  "refreshToken": "jwt_token_string"
}
```

**Response 200:**
```json
{
  "accessToken": "jwt_token_string",
  "refreshToken": "jwt_token_string",
  "expires_at": "2026-05-16T09:41:00+08:00"
}
```

**Errors:** `invalid_token`

---

### GET /api/auth/me

Get the currently logged-in user's full profile.

```
Role required: Any authenticated user
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "John Tan",
  "email": "john@example.com",
  "phone": "+6581234567",
  "role": "volunteer",
  "points_balance": 2450,
  "avatar_url": null,
  "created_at": "2026-05-15T09:41:00+08:00",
  "organisation": null
}
```

---

### PUT /api/auth/me

Update the current user's profile.

```
Role required: Any authenticated user
```

**Request:**
```json
{
  "name": "John Tan Updated",
  "phone": "+6587654321",
  "avatar_url": "https://cdn.example.com/avatars/abc.jpg"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "John Tan Updated",
  "phone": "+6587654321",
  "avatar_url": "https://cdn.example.com/avatars/abc.jpg"
}
```

---

## Volunteer Mobile App

### GET /api/events

Browse volunteering events with filters and search.

```
Role required: volunteer
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | — | Filter by category (e.g. "environment", "elderly") |
| `search` | string | — | Search by event name or description |
| `date` | string | — | Filter by date (YYYY-MM-DD) |
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "East Coast Beach Cleanup",
      "description": "Join us for a morning of keeping our beaches clean.",
      "category": "environment",
      "date": "2026-05-20",
      "start_time": "08:00",
      "end_time": "12:00",
      "location": "East Coast Park, Area C",
      "points_awarded": 50,
      "spots_total": 100,
      "spots_remaining": 42,
      "organiser_name": "National Parks Board",
      "image_url": "https://cdn.example.com/events/beach-cleanup.jpg",
      "is_favorited": false
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 20,
  "total_pages": 2
}
```

---

### GET /api/events/categories

List available event categories for the filter dropdown.

```
Role required: volunteer
```

**Response 200:**
```json
{
  "data": [
    { "id": "environment", "label": "Environment & Cleanup" },
    { "id": "elderly", "label": "Elderly Care" },
    { "id": "youth", "label": "Youth & Education" },
    { "id": "animals", "label": "Animal Welfare" },
    { "id": "community", "label": "Community Service" },
    { "id": "health", "label": "Health & Wellness" }
  ]
}
```

---

### GET /api/events/:id

Get full event details.

```
Role required: volunteer
```

**Response 200:**
```json
{
  "id": "uuid",
  "title": "East Coast Beach Cleanup",
  "description": "Join us for a morning of keeping our beaches clean. Gloves and bags provided.",
  "category": "environment",
  "date": "2026-05-20",
  "start_time": "08:00",
  "end_time": "12:00",
  "location": "East Coast Park, Area C",
  "latitude": 1.3043,
  "longitude": 103.9126,
  "points_awarded": 50,
  "spots_total": 100,
  "spots_remaining": 42,
  "organiser_id": "uuid",
  "organiser_name": "National Parks Board",
  "image_url": "https://cdn.example.com/events/beach-cleanup.jpg",
  "what_to_bring": ["Gloves (optional)", "Sunscreen", "Water bottle"],
  "is_registered": false,
  "is_favorited": false,
  "created_at": "2026-05-10T10:00:00+08:00"
}
```

**Errors:** `not_found`

---

### POST /api/events/:id/register

Join an event as a volunteer.

```
Role required: volunteer
```

**Response 201:**
```json
{
  "registration": {
    "id": "uuid",
    "event_id": "uuid",
    "user_id": "uuid",
    "status": "confirmed",
    "registered_at": "2026-05-15T09:41:00+08:00"
  }
}
```

**Errors:** `already_registered`, `event_full`, `event_past`, `not_found`

---

### DELETE /api/events/:id/register

Leave/cancel an event registration.

```
Role required: volunteer
```

**Response 200:**
```json
{
  "message": "Registration cancelled"
}
```

**Errors:** `not_registered`, `event_past`, `not_found`

---

### GET /api/me/events

Get the volunteer's upcoming and past events.

```
Role required: volunteer
```

**Query Parameters:** `?status=upcoming|past`

**Response 200:**
```json
{
  "upcoming": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "title": "East Coast Beach Cleanup",
      "date": "2026-05-20",
      "start_time": "08:00",
      "location": "East Coast Park",
      "points_awarded": 50,
      "is_checked_in": false,
      "registration_id": "uuid"
    }
  ],
  "past": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "title": "Park Cleanup",
      "date": "2026-05-10",
      "start_time": "09:00",
      "location": "Botanic Gardens",
      "points_earned": 50,
      "was_checked_in": true,
      "has_feedback": true
    }
  ]
}
```

---

### GET /api/me/qr-code

Get the QR code data for the volunteer. The QR code encodes the volunteer's UUID. This endpoint returns the encoded data string (the mobile app renders it as a QR image client-side).

```
Role required: volunteer
```

**Response 200:**
```json
{
  "qr_data": "volunteer:uuid",
  "volunteer_id": "uuid",
  "volunteer_name": "John Tan",
  "expires_at": "2026-05-15T23:59:59+08:00"
}
```

---

### GET /api/me/points

Get points balance and earning history.

```
Role required: volunteer
```

**Query Parameters:** `?page=1&limit=20`

**Response 200:**
```json
{
  "balance": 2450,
  "total_earned": 3200,
  "total_redeemed": 750,
  "history": [
    {
      "id": "uuid",
      "type": "earned",
      "amount": 50,
      "description": "East Coast Beach Cleanup",
      "event_id": "uuid",
      "created_at": "2026-05-15T09:41:00+08:00"
    },
    {
      "id": "uuid",
      "type": "redeemed",
      "amount": -100,
      "description": "FairPrice $5 Voucher",
      "coupon_id": "uuid",
      "created_at": "2026-05-14T14:00:00+08:00"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/rewards

Get available rewards/coupons that can be redeemed with points.

```
Role required: volunteer
```

**Query Parameters:** `?type=online|instore`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "FairPrice $5 Voucher",
      "description": "$5 off at any FairPrice store",
      "type": "online",
      "points_cost": 100,
      "value_cents": 500,
      "image_url": "https://cdn.example.com/rewards/fairprice5.jpg",
      "quantity_remaining": 500,
      "valid_until": "2026-12-31T23:59:59+08:00",
      "merchant_name": "FairPrice"
    },
    {
      "id": "uuid",
      "title": "Kopitiam Coffee",
      "description": "Free kopi at any Kopitiam outlet",
      "type": "instore",
      "points_cost": 50,
      "value_cents": 180,
      "image_url": "https://cdn.example.com/rewards/kopitiam.jpg",
      "quantity_remaining": 100,
      "valid_until": "2026-12-31T23:59:59+08:00",
      "merchant_name": "Kopitiam"
    }
  ]
}
```

---

### POST /api/rewards/:id/redeem

Redeem a reward using points (online redemption — generates a PIN).

```
Role required: volunteer
```

**Request:**
```json
{}
```

**Response 201:**
```json
{
  "coupon": {
    "id": "uuid",
    "title": "FairPrice $5 Voucher",
    "pin_code": "483291",
    "value_cents": 500,
    "points_cost": 100,
    "valid_until": "2026-12-31T23:59:59+08:00",
    "redeemed_at": "2026-05-15T09:41:00+08:00"
  },
  "points_remaining": 2350
}
```

**Errors:** `insufficient_points`, `out_of_stock`, `not_found`

---

### GET /api/me/coupons

Get the volunteer's redeemed coupons and their PINs.

```
Role required: volunteer
```

**Query Parameters:** `?status=active|used|expired`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "FairPrice $5 Voucher",
      "pin_code": "483291",
      "value_cents": 500,
      "status": "active",
      "valid_until": "2026-12-31T23:59:59+08:00",
      "redeemed_at": "2026-05-15T09:41:00+08:00"
    },
    {
      "id": "uuid",
      "title": "Kopitiam Coffee",
      "pin_code": "927451",
      "value_cents": 180,
      "status": "used",
      "valid_until": "2026-12-31T23:59:59+08:00",
      "redeemed_at": "2026-05-10T10:00:00+08:00",
      "used_at": "2026-05-12T14:30:00+08:00"
    }
  ]
}
```

---

### POST /api/events/:id/feedback

Submit feedback for an event.

```
Role required: volunteer (must be checked in)
```

**Request:**
```json
{
  "rating": 5,
  "comment": "Great event, very well organised!"
}
```

**Response 201:**
```json
{
  "feedback": {
    "id": "uuid",
    "event_id": "uuid",
    "rating": 5,
    "comment": "Great event, very well organised!",
    "created_at": "2026-05-15T09:41:00+08:00"
  }
}
```

**Errors:** `not_checked_in`, `already_submitted`, `not_found`

---

### GET /api/events/:id/qna

Get Q&A for an event.

```
Role required: volunteer
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "question": "Do I need to bring my own gloves?",
      "answer": "No, gloves will be provided on site.",
      "asked_by": "John Tan",
      "asked_at": "2026-05-14T10:00:00+08:00",
      "answered_at": "2026-05-14T14:00:00+08:00"
    }
  ]
}
```

---

### POST /api/events/:id/qna

Ask a question about an event.

```
Role required: volunteer
```

**Request:**
```json
{
  "question": "Do I need to bring my own gloves?"
}
```

**Response 201:**
```json
{
  "qna": {
    "id": "uuid",
    "question": "Do I need to bring my own gloves?",
    "asked_at": "2026-05-15T09:41:00+08:00"
  }
}
```

---

### POST /api/favorites/:id

Toggle favorite/unfavorite for an event.

```
Role required: volunteer
```

**Response 200:**
```json
{
  "event_id": "uuid",
  "is_favorited": true
}
```

---

### GET /api/me/favorites

List the volunteer's favorite events.

```
Role required: volunteer
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "East Coast Beach Cleanup",
      "date": "2026-05-20",
      "start_time": "08:00",
      "location": "East Coast Park",
      "points_awarded": 50,
      "category": "environment"
    }
  ]
}
```

---

## Organiser Web Portal

### GET /api/organiser/dashboard

Get the organiser's dashboard stats.

```
Role required: organiser
```

**Response 200:**
```json
{
  "organisation": {
    "id": "uuid",
    "name": "National Parks Board",
    "logo_url": null,
    "status": "approved"
  },
  "stats": {
    "total_events": 24,
    "upcoming_events": 5,
    "total_volunteers_checked_in": 342,
    "average_rating": 4.5
  },
  "recent_activity": [
    {
      "type": "checkin",
      "event_title": "East Coast Beach Cleanup",
      "volunteer_name": "John Tan",
      "timestamp": "2026-05-15T09:41:00+08:00"
    }
  ]
}
```

---

### GET /api/organiser/events

List events created by this organiser.

```
Role required: organiser
```

**Query Parameters:** `?status=upcoming|past|draft&page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "East Coast Beach Cleanup",
      "date": "2026-05-20",
      "start_time": "08:00",
      "end_time": "12:00",
      "category": "environment",
      "status": "published",
      "spots_total": 100,
      "spots_remaining": 42,
      "checked_in_count": 0,
      "registered_count": 58,
      "created_at": "2026-05-10T10:00:00+08:00"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

---

### POST /api/organiser/events

Create a new event.

```
Role required: organiser
```

**Request:**
```json
{
  "title": "East Coast Beach Cleanup",
  "description": "Join us for a morning of keeping our beaches clean.",
  "category": "environment",
  "date": "2026-05-20",
  "start_time": "08:00",
  "end_time": "12:00",
  "location": "East Coast Park, Area C",
  "latitude": 1.3043,
  "longitude": 103.9126,
  "points_awarded": 50,
  "spots_total": 100,
  "what_to_bring": ["Gloves (optional)", "Sunscreen", "Water bottle"],
  "image_url": "https://cdn.example.com/events/beach-cleanup.jpg"
}
```

**Response 201:**
```json
{
  "event": {
    "id": "uuid",
    "title": "East Coast Beach Cleanup",
    "status": "published",
    "created_at": "2026-05-15T09:41:00+08:00"
  }
}
```

**Errors:** `validation_error`

---

### GET /api/organiser/events/:id

Get full event details including registration and check-in data.

```
Role required: organiser
```

**Response 200:**
```json
{
  "id": "uuid",
  "title": "East Coast Beach Cleanup",
  "description": "Join us for a morning of keeping our beaches clean.",
  "category": "environment",
  "date": "2026-05-20",
  "start_time": "08:00",
  "end_time": "12:00",
  "location": "East Coast Park, Area C",
  "latitude": 1.3043,
  "longitude": 103.9126,
  "points_awarded": 50,
  "spots_total": 100,
  "spots_remaining": 42,
  "what_to_bring": ["Gloves (optional)", "Sunscreen"],
  "image_url": "https://cdn.example.com/events/beach-cleanup.jpg",
  "status": "published",
  "created_at": "2026-05-10T10:00:00+08:00",
  "stats": {
    "registered_count": 58,
    "checked_in_count": 0
  }
}
```

---

### PUT /api/organiser/events/:id

Update an existing event.

```
Role required: organiser
```

**Request:** (same shape as POST, all fields optional for partial update)
```json
{
  "title": "Updated Event Title",
  "spots_total": 120
}
```

**Response 200:**
```json
{
  "event": {
    "id": "uuid",
    "title": "Updated Event Title",
    "spots_total": 120,
    "updated_at": "2026-05-15T10:00:00+08:00"
  }
}
```

**Errors:** `not_found`, `not_owned`

---

### DELETE /api/organiser/events/:id

Delete an event (only if no registrations exist).

```
Role required: organiser
```

**Response 200:**
```json
{
  "message": "Event deleted"
}
```

**Errors:** `not_found`, `not_owned`, `has_registrations`

---

### GET /api/organiser/events/:id/roster

Get the registered volunteer list for an event.

```
Role required: organiser
```

**Response 200:**
```json
{
  "event_id": "uuid",
  "event_title": "East Coast Beach Cleanup",
  "total_registered": 58,
  "total_checked_in": 0,
  "volunteers": [
    {
      "user_id": "uuid",
      "name": "John Tan",
      "email": "john@example.com",
      "phone": "+6581234567",
      "registered_at": "2026-05-12T09:00:00+08:00",
      "is_checked_in": false,
      "checked_in_at": null
    }
  ]
}
```

---

### GET /api/organiser/events/:id/feedback

Get feedback submissions for an event.

```
Role required: organiser
```

**Query Parameters:** `?page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "volunteer_name": "John Tan",
      "rating": 5,
      "comment": "Great event!",
      "created_at": "2026-05-15T09:41:00+08:00"
    }
  ],
  "average_rating": 4.5,
  "total": 12
}
```

---

### GET /api/organiser/events/:id/qna

Get all Q&A for an event (for organiser to answer).

```
Role required: organiser
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "question": "Do I need to bring my own gloves?",
      "asked_by": "John Tan",
      "asked_at": "2026-05-14T10:00:00+08:00",
      "is_answered": false,
      "answer": null
    }
  ]
}
```

---

### POST /api/organiser/events/:id/qna/:qid/answer

Answer a volunteer's question.

```
Role required: organiser
```

**Request:**
```json
{
  "answer": "No, gloves will be provided on site."
}
```

**Response 200:**
```json
{
  "qna": {
    "id": "uuid",
    "question": "Do I need to bring my own gloves?",
    "answer": "No, gloves will be provided on site.",
    "answered_at": "2026-05-15T09:41:00+08:00"
  }
}
```

---

## Organiser Scanning App

### GET /api/events/today

Fetch the organiser's events happening today.

```
Role required: organiser
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "East Coast Beach Cleanup",
      "date": "2026-05-15",
      "start_time": "08:00",
      "end_time": "12:00",
      "location": "East Coast Park, Area C",
      "points_awarded": 50,
      "total_registered": 58,
      "total_checked_in": 12,
      "status": "ongoing"
    }
  ]
}
```

---

### POST /api/attendance/scan

Submit a QR scan result for attendance and point awarding.

```
Role required: organiser
Rate limit: 60 req/min per device
```

**Request:**
```json
{
  "volunteer_id": "uuid",
  "event_id": "uuid",
  "scanned_at": "2026-05-15T09:41:00+08:00"
}
```

**Response 200:**
```json
{
  "attendance": {
    "id": "uuid",
    "volunteer_id": "uuid",
    "volunteer_name": "John Tan",
    "event_id": "uuid",
    "event_title": "East Coast Beach Cleanup",
    "points_awarded": 50,
    "checked_in_at": "2026-05-15T09:41:00+08:00"
  },
  "volunteer": {
    "name": "John Tan",
    "points_balance": 2500
  }
}
```

**Errors:** `not_registered`, `already_checked_in`, `event_not_today`, `not_found`

---

### POST /api/attendance/batch

Batch sync offline scans when connectivity is restored.

```
Role required: organiser
```

**Request:**
```json
{
  "scans": [
    {
      "volunteer_id": "uuid",
      "event_id": "uuid",
      "scanned_at": "2026-05-15T09:41:00+08:00"
    }
  ],
  "device_id": "optional_device_identifier"
}
```

**Response 200:**
```json
{
  "results": [
    {
      "volunteer_id": "uuid",
      "status": "success",
      "points_awarded": 50
    },
    {
      "volunteer_id": "uuid",
      "status": "skipped",
      "reason": "already_checked_in"
    }
  ],
  "success_count": 1,
  "skipped_count": 1
}
```

---

### GET /api/events/:id/roster

Get registered volunteer list with check-in status (used for manual entry fallback).

```
Role required: organiser
```

**Response 200:**
```json
{
  "event_id": "uuid",
  "event_title": "East Coast Beach Cleanup",
  "total_registered": 58,
  "total_checked_in": 12,
  "volunteers": [
    {
      "user_id": "uuid",
      "name": "John Tan",
      "email": "john@example.com",
      "is_checked_in": false
    }
  ]
}
```

---

### GET /api/events/:id/stats

Get check-in stats for the event (used for quick stats display).

```
Role required: organiser
```

**Response 200:**
```json
{
  "event_id": "uuid",
  "event_title": "East Coast Beach Cleanup",
  "total_registered": 58,
  "total_checked_in": 12,
  "percentage": 20.7,
  "recent_scans": [
    {
      "volunteer_name": "John Tan",
      "checked_in_at": "2026-05-15T09:41:00+08:00"
    }
  ]
}
```

---

## Admin Web Portal

### GET /api/admin/dashboard

Get admin dashboard metrics.

```
Role required: admin
```

**Response 200:**
```json
{
  "stats": {
    "total_users": 2847,
    "users_growth_pct": 12.4,
    "total_organisers": 12,
    "pending_approvals": 3,
    "total_coupons_issued_today": 1342,
    "coupons_growth_pct": 18,
    "total_redemptions_today": 567,
    "active_merchants": 0
  },
  "recent_activity": [
    {
      "type": "new_user",
      "description": "New volunteer registered",
      "timestamp": "2026-05-15T09:40:00+08:00"
    }
  ],
  "current_date": "Thursday, 14 May 2026",
  "last_updated": "09:42 AM"
}
```

Note: `active_merchants` is reserved for Phase 2. Return 0 or omit.

---

### GET /api/admin/users

List all users with search and filtering.

```
Role required: admin
```

**Query Parameters:** `?search=&role=&status=active|disabled&page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Tan",
      "email": "john@example.com",
      "phone": "+6581234567",
      "role": "volunteer",
      "points_balance": 2450,
      "status": "active",
      "created_at": "2026-05-01T10:00:00+08:00"
    }
  ],
  "total": 2847,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/admin/users/:id

Get full user details.

```
Role required: admin
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "John Tan",
  "email": "john@example.com",
  "phone": "+6581234567",
  "role": "volunteer",
  "points_balance": 2450,
  "status": "active",
  "total_events_attended": 5,
  "total_points_earned": 3200,
  "total_points_redeemed": 750,
  "created_at": "2026-05-01T10:00:00+08:00"
}
```

---

### PUT /api/admin/users/:id

Update user details or change status.

```
Role required: admin
```

**Request:**
```json
{
  "name": "John Tan Updated",
  "status": "disabled"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "John Tan Updated",
  "status": "disabled",
  "updated_at": "2026-05-15T10:00:00+08:00"
}
```

---

### DELETE /api/admin/users/:id

Deactivate a user account.

```
Role required: admin
```

**Response 200:**
```json
{
  "message": "User deactivated"
}
```

---

### GET /api/admin/organisers

List event organisers with approval status.

```
Role required: admin
```

**Query Parameters:** `?status=pending|approved|rejected&page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "organisation_name": "National Parks Board",
      "organisation_type": "statutory_board",
      "contact_name": "Jane Lim",
      "contact_email": "jane@nparks.gov.sg",
      "status": "pending",
      "documents": ["url1", "url2"],
      "created_at": "2026-05-10T10:00:00+08:00"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### PUT /api/admin/organisers/:id/approve

Approve or reject an organiser's registration.

```
Role required: admin
```

**Request:**
```json
{
  "status": "approved",
  "note": "All documents verified"
}
```

**Response 200:**
```json
{
  "organisation": {
    "id": "uuid",
    "name": "National Parks Board",
    "status": "approved"
  }
}
```

---

### GET /api/admin/events

List all events across all organisers.

```
Role required: admin
```

**Query Parameters:** `?status=upcoming|past&page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "East Coast Beach Cleanup",
      "organiser_name": "National Parks Board",
      "date": "2026-05-20",
      "registered_count": 58,
      "checked_in_count": 0,
      "status": "published"
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20
}
```

---

### DELETE /api/admin/events/:id

Remove an event.

```
Role required: admin
```

**Response 200:**
```json
{
  "message": "Event deleted"
}
```

---

### GET /api/admin/coupons

List all coupons/PIN codes with filters.

```
Role required: admin
```

**Query Parameters:** `?status=active|used|expired&page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "pin_code": "483291",
      "title": "FairPrice $5 Voucher",
      "points_cost": 100,
      "value_cents": 500,
      "quantity": 1000,
      "quantity_used": 245,
      "status": "active",
      "valid_from": "2026-05-01T00:00:00+08:00",
      "valid_until": "2026-12-31T23:59:59+08:00",
      "created_at": "2026-05-01T10:00:00+08:00"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

---

### POST /api/admin/coupons

Create a new coupon batch.

```
Role required: admin
```

**Request:**
```json
{
  "coupon_type": "FairPrice $5 Voucher",
  "points_cost": 100,
  "value_cents": 500,
  "quantity": 1000,
  "valid_from": "2026-05-01T00:00:00+08:00",
  "valid_until": "2026-12-31T23:59:59+08:00"
}
```

**Response 201:**
```json
{
  "coupon": {
    "id": "uuid",
    "coupon_type": "FairPrice $5 Voucher",
    "quantity": 1000,
    "created_at": "2026-05-15T10:00:00+08:00"
  },
  "pins_generated": 1000
}
```

Note: The server automatically generates N unique 6-digit PINs for the batch.

---

### PUT /api/admin/coupons/:id

Update coupon details (only editable before any redemptions).

```
Role required: admin
```

**Request:**
```json
{
  "points_cost": 120,
  "valid_until": "2027-01-31T23:59:59+08:00"
}
```

**Response 200:**
```json
{
  "coupon": {
    "id": "uuid",
    "points_cost": 120,
    "valid_until": "2027-01-31T23:59:59+08:00"
  }
}
```

**Errors:** `already_has_redemptions`

---

### DELETE /api/admin/coupons/:id

Delete a coupon batch (only if no redemptions).

```
Role required: admin
```

**Response 200:**
```json
{
  "message": "Coupon deleted"
}
```

**Errors:** `already_has_redemptions`

---

### GET /api/admin/rewards/configuration

Get the current points-to-value configuration.

```
Role required: admin
```

**Response 200:**
```json
{
  "points_per_dollar": 100,
  "min_redeem_points": 50,
  "max_redeem_per_day": 5,
  "default_event_points": 50,
  "updated_at": "2026-05-01T10:00:00+08:00"
}
```

---

### PUT /api/admin/rewards/configuration

Update the reward system configuration.

```
Role required: admin
```

**Request:**
```json
{
  "points_per_dollar": 100,
  "min_redeem_points": 50,
  "max_redeem_per_day": 5
}
```

**Response 200:**
```json
{
  "message": "Configuration updated",
  "updated_at": "2026-05-15T10:00:00+08:00"
}
```

---

### GET /api/admin/redemptions

View redemption history across all coupons.

```
Role required: admin
```

**Query Parameters:** `?page=1&limit=20&from=&to=`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "coupon_type": "FairPrice $5 Voucher",
      "pin_code": "483291",
      "volunteer_name": "John Tan",
      "volunteer_email": "john@example.com",
      "redeemed_at": "2026-05-15T09:41:00+08:00",
      "status": "used",
      "used_at": "2026-05-15T14:30:00+08:00",
      "merchant_name": null
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 20
}
```

Note: `merchant_name` is reserved for Phase 2 (in-store redemption).

---

### GET /api/admin/events/:id/participation

Get event participation data.

```
Role required: admin
```

**Response 200:**
```json
{
  "event": {
    "id": "uuid",
    "title": "East Coast Beach Cleanup",
    "organiser_name": "National Parks Board",
    "date": "2026-05-20"
  },
  "participation": {
    "total_registered": 58,
    "total_checked_in": 0,
    "average_rating": null,
    "feedback_count": 0
  }
}
```

---

## Merchant Redemption App

### POST /api/coupons/verify

Verify a 6-digit PIN code. Returns coupon details if valid.

```
Role required: merchant
Rate limit: 10 req/min per device
```

**Request:**
```json
{
  "pin": "483291",
  "merchant_id": "uuid"
}
```

**Response 200:**
```json
{
  "valid": true,
  "coupon": {
    "id": "uuid",
    "coupon_type": "FairPrice $5 Voucher",
    "value_cents": 500,
    "points_cost": 100,
    "valid_until": "2026-12-31T23:59:59+08:00",
    "is_redeemed": false,
    "quantity_remaining": 755
  }
}
```

**Errors:** `invalid_pin` (PIN doesn't exist), `expired` (past valid_until), `already_redeemed` (single-use), `out_of_stock` (quantity_used >= quantity)

**Error Response Example:**
```json
{
  "error": {
    "code": "already_redeemed",
    "message": "This coupon has already been redeemed.",
    "details": {
      "redeemed_at": "2026-05-14T14:30:00+08:00"
    }
  }
}
```

---

### POST /api/coupons/redeem

Mark a coupon as redeemed after merchant confirms.

```
Role required: merchant
Rate limit: 10 req/min per device
```

**Request:**
```json
{
  "pin": "483291",
  "merchant_id": "uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "redemption": {
    "id": "uuid",
    "pin": "483291",
    "coupon_type": "FairPrice $5 Voucher",
    "value_cents": 500,
    "redeemed_at": "2026-05-15T09:41:00+08:00",
    "merchant_name": "FairPrice Tampines Mall"
  }
}
```

**Errors:** `invalid_pin`, `expired`, `already_redeemed`, `out_of_stock`

---

### POST /api/coupons/reverse

Undo the last redemption within 5 minutes.

```
Role required: merchant
Rate limit: 3 req/min per device
```

**Request:**
```json
{
  "redemption_id": "uuid",
  "merchant_id": "uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Redemption reversed",
  "reversed_at": "2026-05-15T09:45:00+08:00"
}
```

**Errors:** `not_found`, `not_owned_by_merchant`, `too_late` (past 5 min window)

---

### GET /api/merchant/history

Get recent redemptions for this merchant.

```
Role required: merchant
```

**Query Parameters:** `?page=1&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "coupon_type": "FairPrice $5 Voucher",
      "value_cents": 500,
      "pin": "483291",
      "redeemed_at": "2026-05-15T09:41:00+08:00",
      "status": "active",
      "can_reverse": true,
      "reverse_window_until": "2026-05-15T09:46:00+08:00"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

---

## Endpoint Summary

For quick reference, here is every endpoint grouped by app:

### Auth (All Apps)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register volunteer |
| POST | `/api/auth/register/organiser` | Register organiser |
| POST | `/api/auth/login` | Login (all roles) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/me` | Update profile |

### Volunteer Mobile App
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/events` | Browse events |
| GET | `/api/events/categories` | List categories |
| GET | `/api/events/:id` | Event detail |
| POST | `/api/events/:id/register` | Join event |
| DELETE | `/api/events/:id/register` | Leave event |
| GET | `/api/me/events` | My events |
| GET | `/api/me/qr-code` | My QR code data |
| GET | `/api/me/points` | Points balance + history |
| GET | `/api/rewards` | Available rewards |
| POST | `/api/rewards/:id/redeem` | Redeem reward (online) |
| GET | `/api/me/coupons` | My coupons + PINs |
| POST | `/api/events/:id/feedback` | Submit feedback |
| GET | `/api/events/:id/qna` | View event Q&A |
| POST | `/api/events/:id/qna` | Ask a question |
| POST | `/api/favorites/:id` | Toggle favorite |
| GET | `/api/me/favorites` | My favorites |

### Organiser Web Portal
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/organiser/dashboard` | Dashboard stats |
| GET | `/api/organiser/events` | List my events |
| POST | `/api/organiser/events` | Create event |
| GET | `/api/organiser/events/:id` | Event detail + stats |
| PUT | `/api/organiser/events/:id` | Update event |
| DELETE | `/api/organiser/events/:id` | Delete event |
| GET | `/api/organiser/events/:id/roster` | Registered volunteers |
| GET | `/api/organiser/events/:id/feedback` | View feedback |
| GET | `/api/organiser/events/:id/qna` | View Q&A |
| POST | `/api/organiser/events/:id/qna/:qid/answer` | Answer question |

### Organiser Scanning App
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/events/today` | Today's events |
| POST | `/api/attendance/scan` | QR scan check-in |
| POST | `/api/attendance/batch` | Batch sync offline scans |
| GET | `/api/events/:id/roster` | Volunteer list (with check-in status) |
| GET | `/api/events/:id/stats` | Check-in stats |

### Admin Web Portal
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/dashboard` | Dashboard metrics |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | User detail |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Deactivate user |
| GET | `/api/admin/organisers` | List organisers |
| PUT | `/api/admin/organisers/:id/approve` | Approve/reject organiser |
| GET | `/api/admin/events` | List all events |
| DELETE | `/api/admin/events/:id` | Remove event |
| GET | `/api/admin/events/:id/participation` | Event participation data |
| GET | `/api/admin/coupons` | List coupon batches |
| POST | `/api/admin/coupons` | Create coupon batch |
| PUT | `/api/admin/coupons/:id` | Update coupon |
| DELETE | `/api/admin/coupons/:id` | Delete coupon |
| GET | `/api/admin/rewards/configuration` | Get points config |
| PUT | `/api/admin/rewards/configuration` | Update points config |
| GET | `/api/admin/redemptions` | Redemption history |

### Merchant Redemption App
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/coupons/verify` | Verify 6-digit PIN |
| POST | `/api/coupons/redeem` | Mark coupon as used |
| POST | `/api/coupons/reverse` | Undo last redemption |
| GET | `/api/merchant/history` | Recent redemptions |
