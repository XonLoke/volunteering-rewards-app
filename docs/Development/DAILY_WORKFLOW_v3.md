# Daily Workflow Guide v3 — For the Whole Team

> **Updated for Sprint 2+** (Vertical Slice Approach)
> **Changes from v2:** Added CI/CD info, admin portal access, npm test, OneDrive document policy

You don't need to understand git deeply. Just follow these steps in order.

---

## 🗺️ The Big Picture — Vertical Slices

Each team member owns a **vertical slice** — backend API + frontend screens for their feature area.

```
main  ────────  ✅ Always working, always stable
                     │
        ┌──────────────┼──────────────┐──────────────┐
        ▼              ▼              ▼              ▼
       xon           vivian         grace          nurain
   (Infrastructure +   (Events +      (Rewards +     (Admin +
    Auth + Admin Web)   QR Attendance)  Merchant)      Organiser)
```

**Your slice** means you build:

1. **Backend** — Routes + Controller + Service (in `backend/src/routes/`, `controllers/`, `services/`)
2. **Frontend** — Your screens wired to the live API

---

## 📋 Who Owns What

Open `Sprint Breakdown v5.md` to see your full task list. Quick summary:

| Person | Backend Routes | Frontend |
|--------|---------------|----------|
| **Xon** | Auth, Admin, shared middleware | Admin portal (web), CI/CD |
| **Vivian** | Events, Attendance, Favorites | Mobile app (event screens), Scanning app, Organiser rostering |
| **Grace** | Rewards, Merchant | Mobile app (rewards screens), Merchant app (web) |
| **Nurain** | Organiser, Me (volunteer data) | Organiser portal (web), Admin events/redemptions/QR pages |

---

## 📜 The Golden Rule — API Contracts

**API_CONTRACTS_v2.md** (on OneDrive) is the frozen source of truth.

- Every endpoint you build must match its contract exactly — request body, response shape, error codes
- **Never change a contract** without updating the document AND telling the team
- If you need a new field, talk to Xon first

---

## 🔧 Backend Pattern (How Your Code Should Look)

Follow the pattern from the auth service. Each endpoint flows:

```
Route (auth.routes.js)
  → Controller (auth.controller.js)    ← parses request, calls service, sends response
    → Service (auth.service.js)        ← business logic, DB queries, validation
      → Database (via pool.query)
```

**Example structure for your new service:**

```javascript
// services/events.service.js
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

async function browseEvents(filters) {
  // Your DB query here
  const { rows } = await pool.query("SELECT * FROM events WHERE ...", []);
  return { data: rows, total: rows.length, page: 1, limit: 20, total_pages: 0 };
}

module.exports = { browseEvents };
```

**Important:** Create your own service file (e.g. `events.service.js`) and require it in your controller. Don't stuff everything into `auth.service.js`.

---

## 📄 Document Policy

**Project documents** (.md guides, reports, prompts, SVGs, etc.) are kept on **OneDrive**, not GitHub.

GitHub only contains code (`backend/`, `frontend/mobile_app/`, `frontend/web_portals/`, `.github/workflows/`, `Dockerfile`, `docker-compose.yml`). If you need a document, check OneDrive first.

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers an automated check via **GitHub Actions**:

1. **Lint** — Verifies all backend modules load without `require()` errors
2. **Test** — Spins up a fresh PostgreSQL database, runs all migrations, seeds data, then runs tests
3. **Deploy** *(placeholder)* — Ready for cloud deployment (Render / Railway)

You can see pipeline results at: github.com/XonLoke/volunteering-rewards-app/actions

If the pipeline fails, check the run logs for what went wrong and fix before the next push.

---

## 🚀 First Time Setup (do this once)

Each team member opens **Command Prompt** and runs:

```bash
cd D:\c3000c\volunteering-rewards-app
git pull origin main          # get the latest code
cd backend
npm install                   # install backend dependencies (if not done yet)
```

---

## ☀️ Every Day — Start of Work

```bash
# Step 1: Get latest code from everyone
git checkout main
git pull origin main

# Step 2: Switch to your branch
git checkout YOUR_BRANCH_NAME    # xon / vivian / grace / nurain

# Step 3: Merge main's updates into your branch
git merge main
```

**Only if you get conflicts** → Stop and ask Xon for help.

---

## ✏️ While Working

Just edit files normally. When you want to save progress:

```bash
git add .
git commit -m "What you did — e.g. Added events list endpoint"
git push origin YOUR_BRANCH_NAME
```

Do this **as often as you want**. Small commits are good.

---

## 🗓️ End of Sprint — Merge to Main

When your slice is complete, tell Xon. He'll review and merge to `main`.

Everyone then pulls `main` to get the latest:

```bash
git checkout main
git pull origin main
```

---

## 🧪 Testing While Building

You don't need the full database running to check your work:

```bash
# Check your route file loads without errors
cd D:\c3000c\volunteering-rewards-app\backend
node -e "require('./src/routes/events.routes.js'); console.log('Routes OK')"

# Check your controller loads
node -e "require('./src/controllers/events.controller.js'); console.log('Controller OK')"

# Check your service loads
node -e "require('./src/services/events.service.js'); console.log('Service OK')"
```

Full test suite will be added in Sprint 4. For now:

```bash
npm test    # placeholder — confirms test script exists
```

---

## 🌐 Accessing the Admin Portal

The admin portal runs on the Vite dev server:

```
URL:      http://localhost:5173/admin/login
Backend:  http://localhost:3000  (run `cd backend && npm run dev`)
Frontend: http://localhost:5173  (run `cd frontend/web_portals && npm run dev`)
```

**Test login:** `carol@test.com` / `password123` (admin role)

### All Portal URLs

| Portal | URL |
|--------|-----|
| Admin login | http://localhost:5173/admin/login |
| Admin dashboard | http://localhost:5173/admin |
| Organiser portal | http://localhost:5173/organiser |
| Scanning app | http://localhost:5173/scan |
| Merchant app | http://localhost:5173/merchant |

---

## ❓ Common Questions

| Situation | What to do |
|-----------|-----------|
| "I want to see my teammates' latest changes" | `git checkout main` → `git pull` → back to your branch → `git merge main` |
| "I need to add a dependency" | `npm install <package-name>` — tell the team so everyone runs `npm install` too |
| "I messed up my files" | Tell Xon — don't try to fix it yourself |
| "I want to undo my last commit" | `git reset --soft HEAD~1` (only if you haven't pushed yet) |
| "Git says 'merge conflict'" | **Stop and ask for help** — don't force push |
| "My endpoint returns the wrong data" | Check the contract in API_CONTRACTS_v2.md on OneDrive — match it exactly |
| "I need a new column in the database" | Tell Xon — new migrations must be coordinated so they don't conflict |
| "CI pipeline failed" | Check https://github.com/XonLoke/volunteering-rewards-app/actions for logs |
| "Where is the API contracts document?" | On OneDrive — it was removed from GitHub |
