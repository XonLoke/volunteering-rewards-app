/**
 * Organiser Service — Organiser's own data queries
 * Adapted from Nurain's implementation
 */
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

async function getDashboard(organiserId) {
  const { rows: stats } = await pool.query(
    `SELECT
      COUNT(DISTINCT e.id)::int AS total_events,
      COUNT(DISTINCT er.user_id)::int AS total_volunteers,
      COUNT(DISTINCT CASE WHEN e.event_date >= NOW() THEN e.id END)::int AS upcoming_events,
      COALESCE(ROUND(AVG(ef.rating)::numeric, 1), 0)::float AS average_feedback
     FROM events e
     LEFT JOIN event_registrations er ON er.event_id = e.id
     LEFT JOIN event_feedback ef ON ef.event_id = e.id
     WHERE e.organizer_id = $1`,
    [organiserId]
  );

  const { rows: upcoming } = await pool.query(
    `SELECT e.id, e.title, e.location, e.event_date, e.status,
      COUNT(er.user_id)::int AS volunteers
     FROM events e
     LEFT JOIN event_registrations er ON er.event_id = e.id
     WHERE e.organizer_id = $1 AND e.event_date >= NOW()
     GROUP BY e.id
     ORDER BY e.event_date ASC
     LIMIT 5`,
    [organiserId]
  );

  return { stats: stats[0] || {}, upcoming };
}

async function getMyEvents(organiserId, { page = 1, limit = 20, status } = {}) {
  const offset = (page - 1) * limit;
  const params = [organiserId];
  let where = "WHERE e.organizer_id = $1";
  if (status) { params.push(status); where += ` AND e.status = $${params.length}`; }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM events e ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.description, e.location, e.event_date, e.capacity AS spots_total, e.points_value, e.status, e.category, e.created_at,
      (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registered_count,
      (SELECT COUNT(*) FROM attendance_logs al WHERE al.event_id = e.id AND al.scan_type = 'check_in') AS checked_in_count
     FROM events e
     ${where}
     ORDER BY e.event_date DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) };
}

async function createEvent(organiserId, data) {
  const { rows } = await pool.query(
    `INSERT INTO events (organizer_id, title, description, location, event_date, duration_hours, capacity, points_value, category, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming') RETURNING *`,
    [organiserId, data.title, data.description, data.location, data.event_date, data.duration_hours || null, data.capacity, data.points_value, data.category]
  );
  return rows[0];
}

async function updateEvent(organiserId, eventId, data) {
  const { rows } = await pool.query(
    `UPDATE events SET title = COALESCE($3, title), description = COALESCE($4, description),
      location = COALESCE($5, location), event_date = COALESCE($6, event_date),
      duration_hours = COALESCE($7, duration_hours),
      capacity = COALESCE($8, capacity), points_value = COALESCE($9, points_value),
      status = COALESCE($10, status), updated_at = NOW()
     WHERE id = $1 AND organizer_id = $2 RETURNING *`,
    [eventId, organiserId, data.title, data.description, data.location, data.event_date, data.duration_hours, data.capacity, data.points_value, data.status]
  );
  if (rows.length === 0) throw createError(404, "not_found", "Event not found.");
  return rows[0];
}

async function deleteEvent(organiserId, eventId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify ownership first
    const ownerCheck = await client.query(
      "SELECT id FROM events WHERE id = $1 AND organizer_id = $2", [eventId, organiserId]
    );
    if (ownerCheck.rows.length === 0) throw createError(404, "not_found", "Event not found.");

    // Delete related records in order to avoid FK violations
    await client.query("DELETE FROM event_feedback WHERE event_id = $1", [eventId]);
    await client.query("DELETE FROM event_qna WHERE event_id = $1", [eventId]);
    await client.query("DELETE FROM attendance_logs WHERE event_id = $1", [eventId]);
    await client.query("DELETE FROM event_registrations WHERE event_id = $1", [eventId]);

    const { rows } = await client.query(
      "DELETE FROM events WHERE id = $1 RETURNING id", [eventId]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function getRoster(organiserId, eventId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, er.status, er.check_in_time
     FROM event_registrations er
     JOIN users u ON u.id = er.user_id
     JOIN events e ON e.id = er.event_id
     WHERE e.organizer_id = $1 AND e.id = $2
     ORDER BY u.name`,
    [organiserId, eventId]
  );
  return { data: rows };
}

async function getFeedback(organiserId, eventId) {
  const sql = `
    SELECT f.id, f.rating, f.comment, f.created_at,
           (SELECT u.name FROM users u WHERE u.id = f.user_id) AS volunteer_name,
           (SELECT e.title FROM events e WHERE e.id = f.event_id) AS event_title
    FROM event_feedback f
    WHERE f.event_id = $1
      AND (SELECT e2.organizer_id FROM events e2 WHERE e2.id = f.event_id) = $2
    ORDER BY f.created_at DESC`;
  const { rows } = await pool.query(sql, [eventId, organiserId]);
  return { data: rows };
}

async function getQna(organiserId, eventId) {
  const { rows } = await pool.query(
    `SELECT q.id, q.question, q.answer, q.created_at, u.name AS asked_by
     FROM event_qna q
     JOIN events e ON e.id = q.event_id
     JOIN users u ON u.id = q.question_by
     WHERE e.organizer_id = $1 AND q.event_id = $2
     ORDER BY q.created_at DESC`,
    [organiserId, eventId]
  );
  return { data: rows };
}

async function answerQuestion(organiserId, questionId, answer) {
  const { rows } = await pool.query(
    `UPDATE event_qna q SET answer = $1, updated_at = NOW()
     FROM events e WHERE q.event_id = e.id AND e.organizer_id = $2 AND q.id = $3
     RETURNING q.*`,
    [answer, organiserId, questionId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "Question not found.");
  return rows[0];
}

module.exports = { getDashboard, getMyEvents, createEvent, updateEvent, deleteEvent, getRoster, getFeedback, getQna, answerQuestion };
