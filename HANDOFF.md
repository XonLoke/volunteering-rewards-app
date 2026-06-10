# Handoff: F1, F2, F4 Frontend UI Implementation

**Handoff ID:** HO-20260608-001  
**Date:** 8 June 2026  
**From:** Cowork (Xon)  
**To:** Claude Desktop Code  
**Project:** D:\c3000c\volunteering-rewards-app  
**Runtime:** Expo / React Native (mobile app in `app/` directory)

---

## Session Context

All **F1–F4 backends** are complete and pushed to `origin/main`. The backends are running on `http://localhost:3000/api`. What remains is the **frontend UI** for the volunteer mobile app (Expo/React Native in the `app/` directory).

Auth: `POST /api/auth/login` returns `{ token }`. Use `AsyncStorage` to store/retrieve the token (pattern exists in `app/scan.tsx` and other screens).

---

## What's Already Done

- [x] F1 Backend: `GET /api/events/recommended`, `GET /api/events/popular`
- [x] F2 Backend: `GET /api/events/:id/feedback/summary`
- [x] F3 Full Stack: Referral Program (migration, API, auth hook, attendance hook, frontend screen at `app/referral.tsx`)
- [x] F4 Backend: `GET /api/leaderboard`, `/points`, `/events`, `/checkins`, `/redeemed`
- [x] Unit tests (11/11 passing), Test Plan (92 cases), Sprint schedule v7.2

---

## Tasks for Claude Desktop Code

### Task 1: F1 Frontend — "Recommended for You" Section (HIGH)

**Files to modify:**
- `app/home.tsx` — Add "Recommended for You" section below upcoming events

**What to do:**
1. On the volunteer home screen, after the existing upcoming events section, add a new section titled **"Recommended for You"** with a sparkle icon
2. Call `GET /api/events/recommended` using the stored auth token (pattern: `fetch(BASE_URL + "/events/recommended", { headers: { Authorization: Bearer ... } })`)
3. Display up to 5 recommended events in a horizontal scrollable list (similar to how events are already displayed)
4. Each event card should show: title, date, category badge, points value, and a small **relevance score** indicator (e.g., "Match: 85%" or star rating)
5. If no recommendations (empty array), show a subtle "Explore more events to get recommendations" message
6. Handle loading state (skeleton/spinner) and error state (retry button)
7. The `BASE_URL` is `http://192.168.72.201:3000/api` (matching existing pattern in the app)

**Acceptance criteria:**
- [ ] Section appears below upcoming events on home screen
- [ ] Data fetched from live API
- [ ] Loading, error, and empty states handled
- [ ] Category badges match the event's category
- [ ] Relevance score visible on each card
- [ ] Does not interfere with existing home screen functionality

**Dependencies:** None (F1 backend is already deployed)

---

### Task 2: F4 Frontend — Hall of Fame Leaderboard (MEDIUM)

**Files to modify/create:**
- `app/home.tsx` — Add "Hall of Fame" section with a "View All" button
- `app/leaderboard.tsx` — New full leaderboard page

**What to do:**

**Part A — Home screen section:**
1. Add a "Hall of Fame" section at the bottom of the home screen
2. Show a condensed view: top 3 in "Most Points" only, with medal emojis (🥇🥈🥉)
3. Add a "View All" button that navigates to `/leaderboard`

**Part B — Full leaderboard page (`app/leaderboard.tsx`):**
1. Call `GET /api/leaderboard` (returns `most_points`, `most_events`, `most_checkins`, `most_redeemed`)
2. Display 4 tabs/categories: "Points" / "Events" / "Check-ins" / "Redeemed"
3. Each tab shows top 3 with gold/silver/bronze styling
4. Show rank number, name, and their score
5. Header with back button and title "Hall of Fame"
6. Handle loading, error, and empty states

**Acceptance criteria:**
- [ ] Home screen shows top 3 by points with medals
- [ ] "View All" navigates to full leaderboard
- [ ] 4 category tabs work with live data
- [ ] Loading/error/empty states handled
- [ ] Back button works

**Dependencies:** None (F4 backend is already deployed)

---

### Task 3: F2 Frontend — AI Feedback Summary (MEDIUM)

**Files to modify:**
- `app/event-detail.tsx` or wherever event feedback is displayed — Add AI Summary card

**What to do:**
1. On the event detail page (after an event is completed), add a card titled **"AI Feedback Summary"** with a sparkle/robot icon
2. Call `GET /api/events/:id/feedback/summary` to get the AI-generated summary
3. Display:
   - Overall sentiment: positive (😊 green) / neutral (😐 grey) / negative (☹️ red) with a colored badge
   - Average rating (if exists) as stars
   - Breakdown bar: positive count, neutral count, negative count
   - Top positive keywords (as green pills/tags)
   - Top negative keywords (as red pills/tags)
   - "X feedback contained suggestions" if applicable
4. If no feedback exists (total_feedback = 0), show "No feedback yet. Check back after volunteers submit reviews."
5. Handle loading and error states

**Acceptance criteria:**
- [ ] AI Summary card visible on completed event detail
- [ ] Sentiment displayed with correct color/emoji
- [ ] Keyword pills render correctly
- [ ] Empty state shown when no feedback
- [ ] Loading/error states handled

**Dependencies:** Need to know which screen shows event feedback. Check `app/` for the right file.

---

## Technical Context

### Auth Pattern (used in all API calls)
```typescript
const stored = await AsyncStorage.getItem("user");
const user = JSON.parse(stored);
const resp = await fetch(`${BASE_URL}/path`, {
  headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
});
```

### BASE_URL
`http://192.168.72.201:3000/api` (matches existing pattern in the codebase)

### API Endpoints Summary

| Feature | Endpoint | Returns |
|---------|----------|---------|
| F1 | `GET /api/events/recommended` | `{ data: [{ id, title, event_date, category, points_value, relevance_score }] }` |
| F1 | `GET /api/events/popular` | `{ data: [{ id, title, event_date, category, points_value, registrations }] }` |
| F2 | `GET /api/events/:id/feedback/summary` | `{ data: { event_title, total_feedback, overall_sentiment, average_rating, breakdown, top_positive_keywords, top_negative_keywords } }` |
| F4 | `GET /api/leaderboard` | `{ data: { most_points: [...], most_events: [...], most_checkins: [...], most_redeemed: [...] } }` |

### Existing Patterns to Follow
- Theme: use `useTheme()` hook from `@/contexts/ThemeContext`
- Navigation: `useRouter()` from `expo-router`
- Styling: `StyleSheet.create()` with theme colors
- Icons: `@expo/vector-icons` Ionicons
- Storage: `@react-native-async-storage/async-storage`

---

## Notes for Code

1. **Do NOT modify any backend files** — all backend work is complete
2. **Do NOT modify `app/referral.tsx`** — F3 frontend is already built
3. **Follow the existing code patterns** in the `app/` directory exactly (look at `app/home.tsx`, `app/profile.tsx`, `app/scan.tsx` for reference)
4. **Test each feature** by running `npx expo start` and verifying against the live backend
5. **Update the Status Tracking table** below as each task is completed

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| T1: F1 Frontend — Recommended for You | ✅ Done | Built by Vivian — `app/ai-recommendations.tsx` (1,477 lines) |
| T2: F4 Frontend — Hall of Fame | ✅ Done | Built by Vivian — `app/hall-of-fame.tsx` (934 lines) |
| T3: F2 Frontend — AI Feedback Summary | ✅ Done | Built — AI Summary card on organiser Feedback.jsx |
| T4: Integration Tests (34 IT) | ✅ Done | 29 pass, 3 fail, 2 skip — see docs/Test Results — Integration Tests.md |
| T5: Performance Tests (8 PT) | ✅ Done | 6 pass, 2 fail — see docs/Test Results — Performance Tests.md |
| T6: Bug Fixes (IT-20, IT-27, IT-34) | ✅ Done | Fixed events.service.js, rewards.controller.js, attendance.service.js, attendance.controller.js |
