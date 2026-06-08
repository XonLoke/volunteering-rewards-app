const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

const buildEventFilters = ({ search, category }) => {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(e.title ILIKE $${values.length} OR e.description ILIKE $${values.length})`);
  }

  if (category) {
    values.push(category);
    conditions.push(`e.category = $${values.length}`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
};

const browseEvents = async ({ page = 1, limit = 20, search, category } = {}) => {
  const offset = Math.max(page - 1, 0) * limit;
  const { whereClause, values } = buildEventFilters({ search, category });

  const totalQuery = `SELECT COUNT(*)::int AS total FROM events e ${whereClause}`;
  const listQuery = `
    SELECT
      e.*,
      COALESCE(reg.count, 0)::int AS registrations
    FROM events e
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS count
      FROM event_registrations
      GROUP BY event_id
    ) reg ON reg.event_id = e.id
    ${whereClause}
    ORDER BY e.start_time DESC, e.id
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const [totalResult, listResult] = await Promise.all([
    pool.query(totalQuery, values),
    pool.query(listQuery, [...values, limit, offset]),
  ]);

  return {
    events: listResult.rows,
    page,
    limit,
    total: totalResult.rows[0]?.total || 0,
  };
};

const getEventById = async (eventId, userId) => {
  const query = `
    SELECT
      e.*,
      COALESCE(reg.count, 0)::int AS registrations,
      EXISTS(
        SELECT 1
        FROM event_registrations er
        WHERE er.event_id = e.id
          AND er.user_id = $2
      ) AS registered
    FROM events e
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS count
      FROM event_registrations
      GROUP BY event_id
    ) reg ON reg.event_id = e.id
    WHERE e.id = $1
  `;

  const result = await pool.query(query, [eventId, userId]);

  if (!result.rows.length) {
    throw createError(404, "not_found");
  }

  return result.rows[0];
};

const registerForEvent = async (eventId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const eventResult = await client.query(
      "SELECT id, capacity FROM events WHERE id = $1 FOR UPDATE",
      [eventId]
    );

    if (!eventResult.rows.length) {
      throw createError(404, "not_found");
    }

    const { capacity } = eventResult.rows[0];

    const registeredResult = await client.query(
      "SELECT 1 FROM event_registrations WHERE event_id = $1 AND user_id = $2",
      [eventId, userId]
    );

    if (registeredResult.rows.length) {
      throw createError(409, "already_registered");
    }

    if (typeof capacity === "number") {
      const countResult = await client.query(
        "SELECT COUNT(*)::int AS count FROM event_registrations WHERE event_id = $1",
        [eventId]
      );

      if (countResult.rows[0].count >= capacity) {
        throw createError(409, "event_full");
      }
    }

    const insertResult = await client.query(
      "INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) RETURNING *",
      [eventId, userId]
    );

    await client.query("COMMIT");
    return insertResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const unregisterFromEvent = async (eventId, userId) => {
  const eventResult = await pool.query("SELECT id FROM events WHERE id = $1", [eventId]);

  if (!eventResult.rows.length) {
    throw createError(404, "not_found");
  }

  const deleteResult = await pool.query(
    "DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *",
    [eventId, userId]
  );

  if (!deleteResult.rows.length) {
    throw createError(404, "not_found");
  }

  return deleteResult.rows[0];
};

//-----------------------------------------------------------------------
// SECTION: AI Event Recommendations
// Purpose: Content-based filtering engine that recommends upcoming events
//          based on volunteer's past attendance category preferences.
//          Falls back to popular events for new volunteers with no history.
// Formula: Score = SUM(weight of matching categories the volunteer attended)
//-----------------------------------------------------------------------

/**
 * Get recommended events for a volunteer based on their category preferences.
 * @param {number} userId - The volunteer's user ID
 * @param {number} limit - Max recommendations (default 5)
 * @returns {Array} Top recommended events with relevance_score
 */
const getRecommendations = async (userId, limit = 5) => {
  // Step 1: Build volunteer's category preference profile from past events
  const { rows: preferences } = await pool.query(`
    SELECT e.category, COUNT(*) AS weight
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.user_id = $1
      AND e.event_date < NOW()
      AND e.category IS NOT NULL
      AND e.category != ''
    GROUP BY e.category
    ORDER BY weight DESC
  `, [userId]);

  // Step 2: If no history, return popular events as fallback
  if (preferences.length === 0) {
    return getPopularEvents(limit);
  }

  // Step 3: Score upcoming events by category match
  // Build a CASE statement for category matching score
  const caseWhen = preferences.map((p, i) =>
    `WHEN e.category = $${i + 2} THEN $${i + 2 + preferences.length}`
  ).join(' ');

  const params = [userId];
  const weights = [];
  preferences.forEach(p => {
    params.push(p.category);
    weights.push(parseInt(p.weight));
  });
  params.push(...weights, limit);

  const { rows: recommendations } = await pool.query(`
    SELECT
      e.id, e.title, e.description, e.location, e.event_date,
      e.capacity, e.points_value, e.category, e.status,
      COALESCE(reg.count, 0)::int AS registrations,
      COALESCE(${caseWhen} ELSE 0 END)::int AS relevance_score
    FROM events e
    LEFT JOIN (
      SELECT event_id, COUNT(*)::int AS count
      FROM event_registrations
      WHERE status = 'registered'
      GROUP BY event_id
    ) reg ON reg.event_id = e.id
    WHERE e.event_date > NOW()
      AND e.status = 'active'
      AND e.id NOT IN (
        SELECT er2.event_id FROM event_registrations er2
        WHERE er2.user_id = $1 AND er2.status = 'registered'
      )
    ORDER BY relevance_score DESC, e.event_date ASC
    LIMIT $${params.length}
  `, params);

  return recommendations;
};

/**
 * Get most popular upcoming events (fallback for new volunteers).
 * @param {number} limit - Max events (default 5)
 * @returns {Array} Most popular upcoming events
 */
const getPopularEvents = async (limit = 5) => {
  const { rows } = await pool.query(`
    SELECT
      e.id, e.title, e.description, e.location, e.event_date,
      e.capacity, e.points_value, e.category, e.status,
      COALESCE(reg.count, 0)::int AS registrations,
      0 AS relevance_score
    FROM events e
    LEFT JOIN (
      SELECT event_id, COUNT(*)::int AS count
      FROM event_registrations
      WHERE status = 'registered'
      GROUP BY event_id
    ) reg ON reg.event_id = e.id
    WHERE e.event_date > NOW()
      AND e.status = 'active'
    ORDER BY reg.count DESC NULLS LAST, e.event_date ASC
    LIMIT $1
  `, [limit]);

  return rows;
};

module.exports = {
  browseEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  getRecommendations,
  getPopularEvents,
};
