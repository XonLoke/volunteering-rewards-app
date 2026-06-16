# Handoff: Fix Render/Neon Production — Database Connection Debugging

**Handoff ID:** HO-20260616-008
**Date:** 16 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

Render Web Service + Neon PostgreSQL are deployed. The Docker build pipeline was fixed after solving bcrypt native binary mismatch (Windows → Linux Alpine). The service is **Live** and health check passes, but **login fails with `42P01`** — meaning the web service can't find database tables.

**Key strange symptom:** Running `migrationRunner.js` and `seed.js` in the Render Shell works fine — all 23 migrations run and seed data is inserted. But when the web service handles requests, PostgreSQL returns "relation does not exist" for the `users` table (and presumably all others).

This suggests either:
1. The Render Shell connects to a **different database** than the web service (despite same env vars)
2. The tables are created in a **different schema** than what the web service queries
3. Some connection pooling issue with Neon

---

## ✅ What's Already Done

### Deployment Status
- **Render Web Service:** `vol-rewards-api` — **Live** on free tier, Singapore region
- **Neon PostgreSQL:** `neondb` — free tier, no expiry, Singapore region
- **Health check:** `GET /api/health` returns `200 OK` (uptime working)
- **Auth guard:** `GET /api/events` returns `401` with proper error (auth middleware working)
- **SSL:** `DB_SSL=true` + `database.js` updated for conditional SSL
- **Docker build:** Fixed — `.dockerignore` + `apk add python3 make g++` + `npm rebuild bcrypt`

### Migrations & Seed
- Running in Render Shell: ✅ All 23 migrations succeed
- Running seed in Render Shell: ✅ Test users seeded
- Running from web service: ❌ `42P01` — relation `users` not found

---

## 🎯 Task: Diagnose & Fix Neon Database Connection

### Symptoms

```
POST /api/auth/login
→ 500 Internal Server Error
→ Error code: 42P01 (PostgreSQL: relation does not exist)
```

Health check `SELECT 1` works but querying `users` table fails.

### Possible Root Causes to Investigate

**1. Render Shell vs Web Service — different DB connections**
- The Render Shell inherits the web service's environment variables
- But the Shell might connect via `psql` default, while the web service uses the Node `pg` pool
- **Check:** Add a diagnostic endpoint or log the `DB_HOST`/`DB_NAME`/`DB_USER` at startup

**2. Schema mismatch**
- Neon might create tables in a schema other than `public`
- **Check:** Run `SHOW search_path;` and `SELECT current_schema();` from the Node `pg` pool context
- **Check:** `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

**3. Pool initialization timing**
- The `pg` pool might create connections before the Neon database is fully ready
- **Check:** Add `connectionTimeoutMillis: 10000` and retry logic

**4. Neon pooling vs direct connection**
- Neon has two connection types: direct (for migrations) and pooled (for app queries via pgBouncer)
- The `?sslmode=require` in the URL may need adjustment
- **Check:** Try with `?sslmode=require&pgbouncer=true` or remove the query string entirely — use individual env vars instead

**5. Render Shell uses root database, web service uses wrong name**
- Check if the Shell `psql` connects to the default `postgres` database while the web service uses `neondb`

### Diagnostic Steps (do these first)

1. **Add a startup log to confirm env vars** — add this to `index.js` right after `dotenv.config()`:
   ```javascript
   console.log(`Connecting to DB: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} (SSL: ${process.env.DB_SSL})`);
   ```

2. **Deploy and check Render logs** — confirm the env var values printed at startup

3. **From Render Shell, run a query using the pool directly** (not via `psql`):
   ```javascript
   node -e "const {Pool}=require('pg');const pool=new Pool({host:process.env.DB_HOST,port:process.env.DB_PORT,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,ssl:{rejectUnauthorized:false}});pool.query('SELECT current_database(), current_schema()').then(r=>{console.log(r.rows);pool.end()}).catch(e=>{console.error(e);pool.end()})"
   ```

4. **Check if tables exist from the Node pool**:
   ```javascript
   node -e "const {Pool}=require('pg');const pool=new Pool({host:process.env.DB_HOST,port:process.env.DB_PORT,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,ssl:{rejectUnauthorized:false}});pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\\'public\\'').then(r=>{console.log('Tables:',r.rows.map(t=>t.table_name));pool.end()}).catch(e=>{console.error(e);pool.end()})"
   ```

### Fix Options (depending on diagnosis)

**If tables exist in a different schema:**
- Update `search_path` in the database connection config
- Or prefix tables with schema name in queries

**If Render Shell connects to a different database than web service:**
- Verify the env vars Render is actually serving to the web service (not just what's in the dashboard)
- Check if there's a stale `DATABASE_URL` env var from Render's built-in PostgreSQL that overrides individual DB_* vars

**If it's a Neon pooling issue:**
- Try the pooled connection string: append `?sslmode=require&pgbouncer=true` to the connection config
- Or use `pg` pool with `max: 5` instead of `max: 20` for Neon free tier

### Acceptance Criteria
- [ ] `POST /api/auth/login` returns JWT token for all 4 test accounts
- [ ] `GET /api/events` returns event list (with valid token)
- [ ] Render logs show correct DB connection details
- [ ] No `42P01` errors in any endpoint

---

## Technical Context

### Current Env Vars in Render
| Key | Value |
|-----|-------|
| `DB_HOST` | `ep-polished-salad-aow4eewj.c-2.ap-southeast-1.aws.neon.tech` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `neondb` |
| `DB_USER` | `neondb_owner` |
| `DB_PASSWORD` | `npg_XobkqeEf7DH0` |
| `DB_SSL` | `true` |

### Database Config (current)
```javascript
// backend/src/config/database.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || "volunteering_rewards",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : false,
});
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

### Commands
```bash
# Check Render deploy logs for startup output
# Render dashboard → Web Service → Logs tab

# Run from Render Shell (diagnose):
cd backend
node -e "..."  (diagnostic commands above)

# The .env file on Render is NOT used — env vars come from Render dashboard
```

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Render web service live | ✅ Done | `vol-rewards-api` — health check 200 |
| Docker build fixed | ✅ Done | bcrypt binary, .dockerignore |
| Migrations in Shell | ✅ Done | 23/23 succeed |
| Seed in Shell | ✅ Done | Test users created |
| Login via web service | ❌ BUG | `42P01` relation not found |
| Diagnose root cause | ⬜ Pending | See diagnostic steps above |
| Fix connection issue | ⬜ Pending | |
| Verify all endpoints | ⬜ Pending | |
| Update HANDOFF.md | ⬜ Pending | When done |

---

## How to Use

1. Read this HANDOFF.md in full
2. Start with diagnostic steps to find the root cause
3. Apply the fix
4. Update the Status Tracking table
5. Say "Deployment handoff complete" when ready to hand back to Cowork
