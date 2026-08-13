import { query } from "../config/db.js";

export async function getDashboard(organiserId) {
  const stats = await query(
    `SELECT
      COUNT(DISTINCT e.id)::int AS total_events,
      COUNT(DISTINCT er.user_id)::int AS total_volunteers,
      COUNT(DISTINCT CASE WHEN e.start_time >= NOW() THEN e.id END)::int AS upcoming_events,
      COALESCE(ROUND(AVG(f.rating)::numeric, 1), 0)::float AS average_feedback
     FROM events e
     LEFT JOIN event_registrations er ON er.event_id = e.id
     LEFT JOIN feedback f ON f.event_id = e.id
     WHERE e.organiser_id = $1`,
    [organiserId]
  );

  const upcoming = await query(
    `SELECT e.id, e.title, e.location, e.start_time, e.end_time, e.status,
      COUNT(er.user_id)::int AS volunteers
     FROM events e
     LEFT JOIN event_registrations er ON er.event_id = e.id
     WHERE e.organiser_id = $1 AND e.start_time >= NOW()
     GROUP BY e.id
     ORDER BY e.start_time ASC
     LIMIT 5`,
    [organiserId]
  );

  return { stats: stats[0], upcoming };
}

export async function getEvents(organiserId, status, search) {
  const params = [organiserId];
  let where = "WHERE e.organiser_id = $1";

  if (status && status !== "All") {
    params.push(status);
    where += ` AND LOWER(e.status) = LOWER($${params.length})`;
  }

  if (search) {
    params.push(`%${search}%`);
    where += ` AND e.title ILIKE $${params.length}`;
  }

  return query(
    `SELECT e.id, e.title, e.description, e.location, e.start_time, e.end_time, e.status,
      COUNT(er.user_id)::int AS volunteers
     FROM events e
     LEFT JOIN event_registrations er ON er.event_id = e.id
     ${where}
     GROUP BY e.id
     ORDER BY e.start_time DESC`,
    params
  );
}

export async function getEventById(organiserId, eventId) {
  const rows = await query(
    `SELECT * FROM events WHERE id = $1 AND organiser_id = $2`,
    [eventId, organiserId]
  );
  return rows[0];
}

export async function createEvent(organiserId, data) {
  const rows = await query(
    `INSERT INTO events (organiser_id, title, description, location, start_time, end_time, status, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'Upcoming'),$8)
     RETURNING *`,
    [organiserId, data.title, data.description, data.location, data.start_time, data.end_time, data.status, data.image_url]
  );
  return rows[0];
}

export async function updateEvent(organiserId, eventId, data) {
  const rows = await query(
    `UPDATE events SET
      title = COALESCE($3, title),
      description = COALESCE($4, description),
      location = COALESCE($5, location),
      start_time = COALESCE($6, start_time),
      end_time = COALESCE($7, end_time),
      status = COALESCE($8, status),
      image_url = COALESCE($9, image_url),
      updated_at = NOW()
     WHERE id = $1 AND organiser_id = $2
     RETURNING *`,
    [eventId, organiserId, data.title, data.description, data.location, data.start_time, data.end_time, data.status, data.image_url]
  );
  return rows[0];
}

export async function deleteEvent(organiserId, eventId) {
  const rows = await query(
    `DELETE FROM events WHERE id = $1 AND organiser_id = $2 RETURNING id`,
    [eventId, organiserId]
  );
  return rows[0];
}

export async function getRoster(organiserId, eventId) {
  return query(
    `SELECT u.id, u.name, u.email, er.status, er.checked_in_at
     FROM event_registrations er
     JOIN users u ON u.id = er.user_id
     JOIN events e ON e.id = er.event_id
     WHERE e.organiser_id = $1 AND e.id = $2
     ORDER BY u.name`,
    [organiserId, eventId]
  );
}

export async function checkInVolunteer(organiserId, eventId, qrCode) {
  const rows = await query(
    `UPDATE event_registrations er
     SET status = 'checked_in', checked_in_at = NOW()
     FROM users u, events e
     WHERE er.user_id = u.id
       AND er.event_id = e.id
       AND e.organiser_id = $1
       AND e.id = $2
       AND u.volunteer_qr_code = $3
     RETURNING er.*`,
    [organiserId, eventId, qrCode]
  );
  return rows[0];
}

export async function getFeedback(organiserId) {
  return query(
    `SELECT f.id, f.rating, f.comment, f.created_at, u.name AS volunteer_name, e.title AS event_title
     FROM feedback f
     JOIN events e ON e.id = f.event_id
     JOIN users u ON u.id = f.user_id
     WHERE e.organiser_id = $1
     ORDER BY f.created_at DESC`,
    [organiserId]
  );
}
