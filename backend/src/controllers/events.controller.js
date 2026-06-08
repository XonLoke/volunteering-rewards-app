/**
 * Events Controller — Uses Vivian's events.service.js
 *
 * Thin HTTP layer — all business logic in events.service.js
 * Response shapes match API_CONTRACTS_v2.md exactly.
 */

const eventsService = require("../services/events.service");

// ─── GET /api/events ─────────────────────────────────────────
async function browse(req, res, next) {
  try {
    const result = await eventsService.browseEvents(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/events/categories ──────────────────────────────
async function categories(req, res, next) {
  try {
    // Stub — awaiting implementation
    res.json({ data: ["Environment", "Elderly", "Community", "Education", "Health"] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/today (organiser) ───────────────────────
async function today(req, res, next) {
  try {
    // Stub — awaiting implementation
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id ─────────────────────────────────────
async function detail(req, res, next) {
  try {
    const result = await eventsService.getEventById(req.params.id, req.user?.id);
    res.json({ data: result });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/register ───────────────────────────
async function join(req, res, next) {
  try {
    const result = await eventsService.registerForEvent(req.params.id, req.user.id);
    res.status(201).json({ data: result, message: "Registered successfully." });
  } catch (err) { next(err); }
}

// ─── DELETE /api/events/:id/register ─────────────────────────
async function leave(req, res, next) {
  try {
    const result = await eventsService.unregisterFromEvent(req.params.id, req.user.id);
    res.json({ data: result, message: "Unregistered successfully." });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/feedback ───────────────────────────
async function submitFeedback(req, res, next) {
  try {
    res.status(201).json({ message: "Feedback submitted." });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/qna ─────────────────────────────────
async function viewQna(req, res, next) {
  try {
    // Stub — awaiting implementation
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/qna ────────────────────────────────
async function askQuestion(req, res, next) {
  try {
    // Stub — awaiting implementation
    res.status(201).json({ data: { id: 0, question: req.body.question } });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/roster (organiser) ──────────────────
async function roster(req, res, next) {
  try {
    // Stub — awaiting implementation
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/stats (organiser) ───────────────────
async function stats(req, res, next) {
  try {
    // Stub — awaiting implementation
    res.json({ event_id: req.params.id, total_registered: 0, total_checked_in: 0, percentage: 0, recent_scans: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/recommended ─────────────────────────────
async function recommended(req, res, next) {
  try {
    const events = await eventsService.getRecommendations(req.user.id, parseInt(req.query.limit) || 5);
    res.json({ data: events });
  } catch (err) { next(err); }
}

// ─── GET /api/events/popular ─────────────────────────────────
async function popular(req, res, next) {
  try {
    const events = await eventsService.getPopularEvents(parseInt(req.query.limit) || 5);
    res.json({ data: events });
  } catch (err) { next(err); }
}

module.exports = {
  browse, categories, today, detail, join, leave,
  submitFeedback, viewQna, askQuestion, roster, stats,
  recommended, popular,
};
