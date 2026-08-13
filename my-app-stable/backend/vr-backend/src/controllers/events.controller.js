/**
 * Events Controller — Uses Vivian's events.service.js
 *
 * Thin HTTP layer — all business logic in events.service.js
 * Response shapes match API_CONTRACTS_v2.md exactly.
 */

//-----------------------------------------------------------------------
// SECTION: Events Controller — Real Implementation
// Purpose: HTTP layer for event browsing, registration, and management.
//          Previously stubbed endpoints now wired to database queries.
//-----------------------------------------------------------------------

const eventsService = require("../services/events.service");
const { pool } = require("../config/database");

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
    const result = await pool.query(
      "SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND category != '' ORDER BY category"
    );
    const cats = result.rows.map(r => r.category);
    res.json({ data: cats.length ? cats : ["Environment", "Elderly", "Community", "Education", "Health"] });
  } catch (err) { next(err); }
}

// ─── GET /api/events/today (organiser scanning) ──────────────
async function today(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT e.id, e.title, e.description, e.location, e.event_date,
        e.event_date AS start_time,
        (e.event_date + COALESCE(e.duration_hours, 0) * INTERVAL '1 hour') AS end_time,
        e.points_value, e.capacity, e.duration_hours, e.status,
        CASE WHEN (e.event_date + COALESCE(e.duration_hours, 3) * INTERVAL '1 hour') < NOW() THEN true ELSE false END AS has_ended,
        COALESCE(reg.count, 0)::int AS total_registered,
        COALESCE(att.count, 0)::int AS total_checked_in
      FROM events e
      LEFT JOIN (SELECT event_id, COUNT(*)::int AS count FROM event_registrations GROUP BY event_id) reg ON reg.event_id = e.id
      LEFT JOIN (SELECT event_id, COUNT(*)::int AS count FROM attendance_logs GROUP BY event_id) att ON att.event_id = e.id
      WHERE e.event_date::date = CURRENT_DATE
      ORDER BY e.event_date
    `);
    res.json({ data: result.rows });
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
    const result = await pool.query(
      `INSERT INTO event_feedback (event_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, req.body.rating, req.body.comment || null]
    );
    res.status(201).json({ data: result.rows[0], message: "Feedback submitted." });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/qna (volunteer view) ────────────────
async function viewQna(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT q.id, q.question, q.answer, q.created_at AS asked_at, u.name AS asked_by
      FROM event_qna q
      JOIN users u ON u.id = q.question_by
      WHERE q.event_id = $1
      ORDER BY q.created_at DESC
    `, [req.params.id]);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

// ─── POST /api/events/:id/qna (volunteer ask) ────────────────
async function askQuestion(req, res, next) {
  try {
    const result = await pool.query(
      `INSERT INTO event_qna (event_id, question_by, question) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.user.id, req.body.question]
    );
    res.status(201).json({ data: result.rows[0], message: "Question submitted." });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/roster (organiser scan view) ───────
async function roster(req, res, next) {
  try {
    const eventResult = await pool.query(
      "SELECT title FROM events WHERE id = $1", [req.params.id]
    );
    const volunteersResult = await pool.query(`
      SELECT u.id AS user_id, u.name, u.email,
        er.created_at AS registered_at,
        CASE WHEN al.id IS NOT NULL THEN true ELSE false END AS is_checked_in,
        al.scanned_at AS check_in_time
      FROM event_registrations er
      JOIN users u ON u.id = er.user_id
      LEFT JOIN attendance_logs al ON al.event_id = er.event_id AND al.user_id = er.user_id
      WHERE er.event_id = $1
      ORDER BY u.name
    `, [req.params.id]);

    const volunteers = volunteersResult.rows;
    const totalRegistered = volunteers.length;
    const totalCheckedIn = volunteers.filter(v => v.is_checked_in).length;

    res.json({
      event_title: eventResult.rows[0]?.title || '',
      total_registered: totalRegistered,
      total_checked_in: totalCheckedIn,
      volunteers,
    });
  } catch (err) { next(err); }
}

// ─── GET /api/events/:id/stats (organiser) ───────────────────
async function stats(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(reg.count, 0)::int AS total_registered,
        COALESCE(att.count, 0)::int AS total_checked_in
      FROM events e
      LEFT JOIN (SELECT event_id, COUNT(*)::int AS count FROM event_registrations GROUP BY event_id) reg ON reg.event_id = e.id
      LEFT JOIN (SELECT event_id, COUNT(*)::int AS count FROM attendance_logs GROUP BY event_id) att ON att.event_id = e.id
      WHERE e.id = $1
    `, [req.params.id]);

    const row = result.rows[0] || { total_registered: 0, total_checked_in: 0 };
    const pct = row.total_registered > 0 ? Math.round((row.total_checked_in / row.total_registered) * 100) : 0;

    res.json({
      event_id: parseInt(req.params.id),
      total_registered: row.total_registered,
      total_checked_in: row.total_checked_in,
      percentage: pct,
      recent_scans: [],
    });
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
