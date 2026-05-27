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

module.exports = {
  browseEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
};
