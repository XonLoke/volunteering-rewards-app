//-----------------------------------------------------------------------
// SECTION: Hall of Fame Leaderboard (F4)
// Purpose: Multi-metric gamification leaderboard that displays top 3
//          volunteers across points, events attended, check-ins, and
//          points redeemed categories.
//-----------------------------------------------------------------------
const { pool } = require("../config/database");

//-----------------------------------------------------------------------
// SECTION: Top 3 by Points Balance
//-----------------------------------------------------------------------
async function topByPoints(limit = 3) {
  const { rows } = await pool.query(`
    SELECT id, name, points, volunteer_qr_code,
           ROW_NUMBER() OVER (ORDER BY points DESC) AS rank
    FROM users
    WHERE role_id = (SELECT id FROM roles WHERE role_name = 'volunteer')
    ORDER BY points DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

//-----------------------------------------------------------------------
// SECTION: Top 3 by Events Attended
//-----------------------------------------------------------------------
async function topByEvents(limit = 3) {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.points,
           COUNT(er.id)::int AS total_events,
           ROW_NUMBER() OVER (ORDER BY COUNT(er.id) DESC) AS rank
    FROM users u
    JOIN event_registrations er ON er.user_id = u.id AND er.status = 'registered'
    WHERE u.role_id = (SELECT id FROM roles WHERE role_name = 'volunteer')
    GROUP BY u.id, u.name, u.points
    ORDER BY total_events DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

//-----------------------------------------------------------------------
// SECTION: Top 3 by Check-Ins (Attendance Logs)
//-----------------------------------------------------------------------
async function topByCheckins(limit = 3) {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.points,
           COUNT(al.id)::int AS total_checkins,
           ROW_NUMBER() OVER (ORDER BY COUNT(al.id) DESC) AS rank
    FROM users u
    JOIN attendance_logs al ON al.user_id = u.id
    WHERE u.role_id = (SELECT id FROM roles WHERE role_name = 'volunteer')
    GROUP BY u.id, u.name, u.points
    ORDER BY total_checkins DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

//-----------------------------------------------------------------------
// SECTION: Top 3 by Points Redeemed
//-----------------------------------------------------------------------
async function topByRedeemed(limit = 3) {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.points,
           COALESCE(SUM(rl.points_spent), 0)::int AS total_redeemed,
           ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(rl.points_spent), 0) DESC) AS rank
    FROM users u
    LEFT JOIN redemption_logs rl ON rl.user_id = u.id
    WHERE u.role_id = (SELECT id FROM roles WHERE role_name = 'volunteer')
    GROUP BY u.id, u.name, u.points
    ORDER BY total_redeemed DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

//-----------------------------------------------------------------------
// SECTION: All Leaderboard Categories in One Call
//-----------------------------------------------------------------------
async function getFullLeaderboard() {
  const [points, events, checkins, redeemed] = await Promise.all([
    topByPoints(3),
    topByEvents(3),
    topByCheckins(3),
    topByRedeemed(3),
  ]);

  return {
    most_points: points,
    most_events: events,
    most_checkins: checkins,
    most_redeemed: redeemed,
  };
}

module.exports = {
  topByPoints,
  topByEvents,
  topByCheckins,
  topByRedeemed,
  getFullLeaderboard,
};
