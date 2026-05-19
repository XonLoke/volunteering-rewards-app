/**
 * Organiser Controller — Web portal for event organisers
 *
 * Response shapes defined in API_CONTRACTS.md (Organiser Web Portal section).
 */

// ─── GET /api/organiser/dashboard ────────────────────────────
async function dashboard(req, res, next) {
  try {
    // TODO: Return org info + stats + recent activity
    res.json({ organisation: {}, stats: {}, recent_activity: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/organiser/events ───────────────────────────────
async function listEvents(req, res, next) {
  try {
    // TODO: List events belonging to this organiser
    // Query: ?status=upcoming|past|draft&page=1&limit=20
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

// ─── POST /api/organiser/events ──────────────────────────────
async function createEvent(req, res, next) {
  try {
    // TODO: Create event with organiser's org
    res.status(201).json({ event: { id: "", title: "", status: "published", created_at: "" } });
  } catch (err) { next(err); }
}

// ─── GET /api/organiser/events/:id ───────────────────────────
async function getEvent(req, res, next) {
  try {
    // TODO: Full event detail with stats
    res.json({ id: req.params.id });
  } catch (err) { next(err); }
}

// ─── PUT /api/organiser/events/:id ───────────────────────────
async function updateEvent(req, res, next) {
  try {
    // TODO: Update event fields (partial)
    // Errors: not_found, not_owned
    res.json({ event: { id: req.params.id, updated_at: "" } });
  } catch (err) { next(err); }
}

// ─── DELETE /api/organiser/events/:id ────────────────────────
async function deleteEvent(req, res, next) {
  try {
    // TODO: Delete event (only if no registrations)
    // Errors: not_found, not_owned, has_registrations
    res.json({ message: "Event deleted" });
  } catch (err) { next(err); }
}

// ─── GET /api/organiser/events/:id/roster ────────────────────
async function roster(req, res, next) {
  try {
    // TODO: Registered volunteers with check-in status
    res.json({ event_id: req.params.id, event_title: "", total_registered: 0, total_checked_in: 0, volunteers: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/organiser/events/:id/feedback ──────────────────
async function viewFeedback(req, res, next) {
  try {
    // TODO: Feedback list with average rating
    res.json({ data: [], average_rating: 0, total: 0 });
  } catch (err) { next(err); }
}

// ─── GET /api/organiser/events/:id/qna ───────────────────────
async function viewQna(req, res, next) {
  try {
    // TODO: Q&A for organiser to answer
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── POST /api/organiser/events/:id/qna/:qid/answer ─────────
async function answerQuestion(req, res, next) {
  try {
    // TODO: Post answer to a question
    // Body: { answer: string }
    res.json({ qna: { id: "", question: "", answer: "", answered_at: "" } });
  } catch (err) { next(err); }
}

module.exports = {
  dashboard, listEvents, createEvent, getEvent, updateEvent, deleteEvent,
  roster, viewFeedback, viewQna, answerQuestion,
};
