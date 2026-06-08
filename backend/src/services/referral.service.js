//-----------------------------------------------------------------------
// SECTION: Referral Service (F3)
// Purpose: Multi-level referral tracking — generate codes, track upline/
//          downline relationships, award bonus points on referral activity.
//-----------------------------------------------------------------------
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

//-----------------------------------------------------------------------
// SECTION: Referral Code Generation
// Purpose: Generate a unique 8-character alphanumeric referral code.
//-----------------------------------------------------------------------
async function generateReferralCode(userId, userName) {
  // Create code from name initials + random digits
  const initials = (userName || "VOL")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  const code = `${initials}${randomSuffix}`;

  // Check uniqueness
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE referral_code = $1",
    [code]
  );
  if (rows.length > 0) {
    // Collision — try again with different suffix
    return generateReferralCode(userId, userName);
  }

  // Save to user record
  await pool.query(
    "UPDATE users SET referral_code = $1 WHERE id = $2",
    [code, userId]
  );

  return code;
}

//-----------------------------------------------------------------------
// SECTION: Get Referral Code for Current User
//-----------------------------------------------------------------------
async function getMyReferralCode(userId) {
  const { rows } = await pool.query(
    "SELECT referral_code FROM users WHERE id = $1",
    [userId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "User not found.");

  // Generate code if user doesn't have one yet
  if (!rows[0].referral_code) {
    const { rows: userRows } = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [userId]
    );
    const code = await generateReferralCode(userId, userRows[0]?.name);
    return { referral_code: code };
  }

  return { referral_code: rows[0].referral_code };
}

//-----------------------------------------------------------------------
// SECTION: Link Referral on Registration
// Purpose: Called during registration to link a new user to their referrer.
//          Sets referred_by_code on the new user.
//-----------------------------------------------------------------------
async function linkReferral(newUserId, referralCode) {
  if (!referralCode) return;

  // Find the referrer
  const { rows: referrers } = await pool.query(
    "SELECT id, referral_code, referred_by_code FROM users WHERE referral_code = $1",
    [referralCode]
  );
  if (referrers.length === 0) return; // Invalid code — silently ignore

  const referrer = referrers[0];

  // Update new user with referral code
  await pool.query(
    "UPDATE users SET referred_by_code = $1 WHERE id = $2",
    [referralCode, newUserId]
  );

  // Create level 1 referral log
  await pool.query(
    `INSERT INTO referral_logs (referrer_id, referred_id, level, status)
     VALUES ($1, $2, 1, 'pending')`,
    [referrer.id, newUserId]
  );

  // If referrer has their own upline, create level 2 referral log
  if (referrer.referred_by_code) {
    const { rows: upline } = await pool.query(
      "SELECT id FROM users WHERE referral_code = $1",
      [referrer.referred_by_code]
    );
    if (upline.length > 0) {
      await pool.query(
        `INSERT INTO referral_logs (referrer_id, referred_id, level, status)
         VALUES ($1, $2, 2, 'pending')`,
        [upline[0].id, newUserId]
      );
    }
  }
}

//-----------------------------------------------------------------------
// SECTION: Award Points on First Event Attendance
// Purpose: Called when a referred volunteer attends their first event.
//          Level 1 referrer gets 50 pts, Level 2 gets 25 pts.
//-----------------------------------------------------------------------
async function awardReferralPoints(referredUserId) {
  // Check if this user was referred
  const { rows: users } = await pool.query(
    "SELECT id, referred_by_code FROM users WHERE id = $1 AND referred_by_code IS NOT NULL",
    [referredUserId]
  );
  if (users.length === 0) return;

  // Find pending referral logs for this user
  const { rows: logs } = await pool.query(
    `SELECT rl.id, rl.referrer_id, rl.level
     FROM referral_logs rl
     WHERE rl.referred_id = $1 AND rl.status = 'pending'`,
    [referredUserId]
  );

  for (const log of logs) {
    const points = log.level === 1 ? 50 : 25;

    // Award points
    await pool.query(
      "UPDATE users SET points = points + $1, referral_points = referral_points + $2 WHERE id = $3",
      [points, points, log.referrer_id]
    );

    // Update log status
    await pool.query(
      "UPDATE referral_logs SET status = 'rewarded', points_awarded = $1 WHERE id = $2",
      [points, log.id]
    );
  }
}

//-----------------------------------------------------------------------
// SECTION: Get Referral Stats & Downline
// Purpose: Returns the user's referral stats and scrollable downline list.
//-----------------------------------------------------------------------
async function getReferralStats(userId) {
  const { rows: stats } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE level = 1) AS level_1_count,
       COUNT(*) FILTER (WHERE level = 2) AS level_2_count,
       COALESCE(SUM(points_awarded), 0) AS total_points_earned
     FROM referral_logs
     WHERE referrer_id = $1`,
    [userId]
  );

  // Get level 1 downline (scrollable text format: "name (email)")
  const { rows: level1 } = await pool.query(
    `SELECT u.name, u.email
     FROM referral_logs rl
     JOIN users u ON u.id = rl.referred_id
     WHERE rl.referrer_id = $1 AND rl.level = 1
     ORDER BY rl.created_at DESC`,
    [userId]
  );

  // Get level 2 downline
  const { rows: level2 } = await pool.query(
    `SELECT u.name, u.email
     FROM referral_logs rl
     JOIN users u ON u.id = rl.referred_id
     WHERE rl.referrer_id = $1 AND rl.level = 2
     ORDER BY rl.created_at DESC`,
    [userId]
  );

  const formatDownline = (rows) =>
    rows.map((r) => `${r.name} (${r.email})`).join("\n");

  return {
    referral_code: (await getMyReferralCode(userId)).referral_code,
    level_1_count: parseInt(stats[0]?.level_1_count) || 0,
    level_2_count: parseInt(stats[0]?.level_2_count) || 0,
    total_points_earned: parseInt(stats[0]?.total_points_earned) || 0,
    downline_1st_level: formatDownline(level1),
    downline_2nd_level: formatDownline(level2),
  };
}

module.exports = {
  generateReferralCode,
  getMyReferralCode,
  linkReferral,
  awardReferralPoints,
  getReferralStats,
};
