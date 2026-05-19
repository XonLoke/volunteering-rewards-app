/**
 * Events Controller — Workflow B
 *
 * Every function is a stub. Member B fills in the business logic
 * using the authService pattern from Sprint 1.
 *
 * Response shapes are defined in API_CONTRACTS.md.
 */

// ─── GET /api/events ─────────────────────────────────────────
async function browse(req, res, next) {
  try {
    // TODO: EVT-02 — Search, filter, paginate events
    // Query params: ?category=&search=&date=&page=1&limit=20
    res.json({ data: [], total: 0, page: 1, limit: 20, total_pages: 0 });
  } catch (err) { next(err); }
}

// ─── GET /api/events/categories ──────────────────────────────
async function categories(req, res, next) {
  try {
    // TODO: EVT-02 — Return list of event categories
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id ─────────────────────────────────────
async function detail(req, res, next) {
  try {
    // TODO: EVT-02 — Return full event detail with is_registered, is_favorited
    res.json({ id: req.params.id });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/register ───────────────────────────
async function join(req, res, next) {
  try {
    // TODO: EVT-03 — Register current user for event
    // Errors: already_registered, event_full, event_past
    res.status(201).json({ registration: { id: "", event_id: "", user_id: "", status: "confirmed" } });
  } catch (err) { next(err); }
}

// ─── DELETE /api/events/:id/register ─────────────────────────
async function leave(req, res, next) {
  try {
    // TODO: EVT-03 — Cancel registration
    // Errors: not_registered, event_past
    res.json({ message: "Registration cancelled" });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/feedback ───────────────────────────
async function submitFeedback(req, res, next) {
  try {
    // TODO: EVT-06 — Submit rating + comment
    // Body: { rating: 1-5, comment: string }
    // Errors: not_checked_in, already_submitted
    res.status(201).json({ feedback: { id: "", event_id: "", rating: 0, comment: "", created_at: "" } });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/qna ─────────────────────────────────
async function viewQna(req, res, next) {
  try {
    // TODO: EVT-07 — Return Q&A list for event
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/qna ────────────────────────────────
async function askQuestion(req, res, next) {
  try {
    // TODO: EVT-07 — Submit a question
    // Body: { question: string }
    res.status(201).json({ qna: { id: "", question: "", asked_at: "" } });
  } catch (err) { next(err); }
}

// ─── GET /api/events/today ────────────────────────────────────
async function today(req, res, next) {
  try {
    // TODO: EVT-08 — Return today's events for scanning app
    // Filter: date = today, status = active
    // Response shape matches EventSelect card requirements
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/roster ──────────────────────────────
async function roster(req, res, next) {
  try {
    // TODO: EVT-09 — Return volunteer list for an event with check-in status
    // Used by scanning app Roster.jsx and organiser Roster.jsx
    // Response: { data: [{ user_id, name, email, checked_in_at, checked_in }] }
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/stats ───────────────────────────────
async function stats(req, res, next) {
  try {
    // TODO: EVT-10 — Return check-in stats for the event
    // Used by scanning app for quick stats display
    // Response: { event_id, event_title, total_registered, total_checked_in, percentage, recent_scans }
    res.json({
      event_id: req.params.id,
      event_title: "",
      total_registered: 0,
      total_checked_in: 0,
      percentage: 0,
      recent_scans: [],
    });
  } catch (err) { next(err); }
}

module.exports = {
  browse, categories, detail,
  join, leave,
  submitFeedback, viewQna, askQuestion,
  today, roster, stats,
};
