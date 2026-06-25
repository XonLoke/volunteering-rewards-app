Write unit tests for the referral (sponsorship) service.

## Project Context

- **Project:** Volunteering Rewards App (c3000c)
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/referral.service.js
- **Output path:** tests/unit/referral.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS (`require`/`module.exports`)
- **DB mocking:** Replace `pool.query` function directly

## Service Functions to Test

```js
// Get sponsorship configuration (points values)
getConfig()
// Returns: { direct_sponsor_points, helped_sponsor_points, upline_helper_points, max_depth }
// Returns defaults if no config row in DB

// Link sponsorship when user registers with upline emails
linkSponsorship(userId, upline2Email, upline1Email)
// upline_2_email = direct sponsor (person who recruited them)
// upline_1_email = parent sponsor (person who sponsored the recruiter)
// Returns: { upline2Id, upline1Id } (null if emails don't match volunteers)

// Award direct sponsor points (full 10 pts — own effort, no help)
awardDirectSponsorPoints(referrerId, newUserId)
// Returns: undefined (inserts referral_log)

// Get sponsorship profile for current user
getMySponsorshipProfile(userId)
// Returns: { email, upline_1_email, upline_2_email, downline_1st_level_count, downline_2nd_level_count, downline_1st_level, downline_2nd_level, total_sponsorship_points }
// Throws: 404 if user not found
```

## Key Details

- u2 up Email = direct sponsor (who recruited them) — gets helped_sponsor_points
- u1 up Email = parent sponsor (who helped) — gets upline_helper_points
- Both upline emails are saved on the user record
- referrer lookup requires role = 'volunteer'
- Non-matching emails are silently ignored (upline2Id/upline1Id = null)
- If both emails are provided: referral_logs get 2 entries (level 1, level 2)

## Test Pattern

```js
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");

function mockPoolWith(returnValues) {
  let callIdx = 0;
  pool.query = function mockQuery() {
    return returnValues[callIdx++] || { rows: [] };
  };
}
```

## What to Cover

### getConfig
- ✅ Returns saved config from DB when row exists
- ✅ Returns default values when DB has no config row
- ✅ Returns config with correct point values

### linkSponsorship
- ✅ Links both upline emails successfully and creates referral entries
- ✅ Handles only upline2 (direct sponsor) without upline1
- ✅ Handles only upline1 (parent) without upline2
- ✅ Silently skips unmatched emails (returns null for that ID)
- ✅ Saves upline emails to user record (UPDATE)
- ✅ Uses correct point amounts from config (helped_sponsor_points for level 1, upline_helper_points for level 2)

### awardDirectSponsorPoints
- ✅ Inserts referral_log with correct direct_sponsor_points from config
- ✅ Creates entry with level 1 and status 'rewarded'

### getMySponsorshipProfile
- ✅ Returns full profile with downline counts and points
- ✅ Returns empty downlines when user has no referrals
- ✅ Throws 404 if user doesn't exist
- ✅ Calculates total sponsorship points correctly
- ✅ Includes email and upline info in response

## Verification

After writing, run:
```
cd D:\c3000c\volunteering-rewards-app\backend
npm test
```

All tests must pass. Write ONLY the test file.
