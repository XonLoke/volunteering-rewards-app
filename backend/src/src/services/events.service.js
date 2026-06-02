const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

const buildEventFilters = ({ search, category }) => {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(e.title ILIKE $${values.length} OR e.description ILIKE $${values.length})`
    );
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

const browseEvents = async ({
  page = 1,
  limit = 20,
  search,
  category,
  userId,
} = {}) => {
  const offset = Math.max(page - 1, 0) * limit;
  const { whereClause, values } = buildEventFilters({ search, category });

  const userIdValue = userId ? Number(userId) : null;

  const totalQuery = `
    SELECT COUNT(*)::int AS total
    FROM events e
    ${whereClause}
  `;

  const listQuery = `
    SELECT
      e.*,
      o.org_name,
      COALESCE(reg.count, 0)::int AS registrations,
      CASE
        WHEN $${values.length + 1}::int IS NULL THEN false
        ELSE EXISTS (
          SELECT 1
          FROM event_registrations er2
          WHERE er2.event_id = e.id
            AND er2.user_id = $${values.length + 1}
        )
      END AS registered
    FROM events e
    LEFT JOIN organizations o ON e.organization_id = o.id
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS count
      FROM event_registrations
      GROUP BY event_id
    ) reg ON reg.event_id = e.id
    ${whereClause}
    ORDER BY e.event_date ASC, e.id ASC
    LIMIT $${values.length + 2}
    OFFSET $${values.length + 3}
  `;

  const [totalResult, listResult] = await Promise.all([
    pool.query(totalQuery, values),
    pool.query(listQuery, [...values, userIdValue, limit, offset]),
  ]);

  return {
    events: listResult.rows,
    page,
    limit,
    total: totalResult.rows[0]?.total || 0,
  };
};

const getEventById = async (eventId, userId) => {
  const userIdValue = userId ? Number(userId) : null;

  const query = `
    SELECT
      e.*,
      o.org_name,
      COALESCE(reg.count, 0)::int AS registrations,
      CASE
        WHEN $2::int IS NULL THEN false
        ELSE EXISTS (
          SELECT 1
          FROM event_registrations er
          WHERE er.event_id = e.id
            AND er.user_id = $2
        )
      END AS registered
    FROM events e
    LEFT JOIN organizations o ON e.organization_id = o.id
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS count
      FROM event_registrations
      GROUP BY event_id
    ) reg ON reg.event_id = e.id
    WHERE e.id = $1
  `;

  const result = await pool.query(query, [eventId, userIdValue]);

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
      `
      SELECT
        id,
        title,
        capacity,
        status
      FROM events
      WHERE id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    if (!eventResult.rows.length) {
      throw createError(404, "event_not_found");
    }

    const event = eventResult.rows[0];

    if (event.status && event.status !== "upcoming") {
      throw createError(400, "event_not_available");
    }

    const registeredResult = await client.query(
      `
      SELECT 1
      FROM event_registrations
      WHERE event_id = $1
        AND user_id = $2
      `,
      [eventId, userId]
    );

    if (registeredResult.rows.length) {
      throw createError(409, "already_registered");
    }

    if (event.capacity !== null && event.capacity !== undefined) {
      const countResult = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM event_registrations
        WHERE event_id = $1
        `,
        [eventId]
      );

      const currentCount = Number(countResult.rows[0].count || 0);
      const capacity = Number(event.capacity || 0);

      if (capacity > 0 && currentCount >= capacity) {
        throw createError(409, "event_full");
      }
    }

    const insertResult = await client.query(
      `
      INSERT INTO event_registrations (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
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
  const eventResult = await pool.query(
    `
    SELECT id
    FROM events
    WHERE id = $1
    `,
    [eventId]
  );

  if (!eventResult.rows.length) {
    throw createError(404, "event_not_found");
  }

  console.log("SERVICE UNREGISTER EVENT");
  console.log("eventId:", eventId);
  console.log("userId:", userId);

  const beforeCheck = await pool.query(
    `
    SELECT *
    FROM event_registrations
    WHERE event_id = $1
      AND user_id = $2
    `,
    [eventId, userId]
  );

  console.log("service booking rows before delete:", beforeCheck.rows);

  const deleteResult = await pool.query(
    `
    DELETE FROM event_registrations
    WHERE event_id = $1
      AND user_id = $2
    RETURNING *
    `,
    [eventId, userId]
  );

  console.log("service deleted rows:", deleteResult.rows);

  return deleteResult.rows[0] || null;
};

module.exports = {
  browseEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
};