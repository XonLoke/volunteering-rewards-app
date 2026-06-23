# Volunteering Rewards App — CLAUDE.md

> **Primary project context:** See `AGENTS.md` (in parent directory `d:/c3000c/`) for full project overview, tech stack, architecture, conventions, and commands.
>
> This file contains Claude Code-specific overrides and additions.

---

## Quick Reference

| Key | Value |
|-----|-------|
| **Project root** | `d:/c3000c/volunteering-rewards-app/` |
| **AGENTS.md** | `d:/c3000c/AGENTS.md` (read this first for full context) |
| **Docs** | `docs/` (40+ documents — API contracts, DB schema, test plans, sprint reports) |
| **Repo** | `https://github.com/XonLoke/volunteering-rewards-app` (private) |
| **Branch** | `main` (default), feature branches: `xon`, `grace`, `vivian`, `nurain` |

---

## Claude-Specific Rules

### 1. File priority when reading
```
AGENTS.md → docs/DATABASE_TABLES.md → docs/API_CONTRACTS_v2.md → source code
```

### 2. Permission patterns already allowlisted
Check `.claude/settings.local.json` or `.claude/settings.json` before asking for sudo/new permissions.

Commonly allowed:
- `npm test`, `npm run dev`, `npm run migrate`, `npm run seed`
- `git add`, `git commit`, `git push`, `git reset`, `git restore`
- `curl` API calls to localhost and production
- `node index.js` (start backend)
- `npx expo *`, `eas *`, `npx vercel *`

### 3. Sensitive files — never read or commit
- `HANDOFF.md` (contains Jira API token — in `.gitignore`)
- `.env` files (database credentials, JWT secrets)
- Build logs (`build_*.txt`, `eas_build_log.txt`, `gradle_*.txt`)

### 4. Workflow
1. Read `AGENTS.md` + relevant `docs/` first
2. Understand the existing architecture before making changes
3. Run tests before declaring done: `cd backend && npm test`
4. Commit with conventional prefixes: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`

### 5. Testing
```bash
# Unit tests (backend)
cd backend && npm run test:unit

# Smoke/integration tests
cd backend && npm run test:smoke

# All tests
cd backend && npm test
```

### 6. Deployment check
```bash
curl https://vol-rewards-api.onrender.com/api/health
curl https://webportals-lovat.vercel.app/admin/login
```

### 7. Key directories
| Directory | Purpose |
|-----------|---------|
| `backend/src/` | Express API (CommonJS) |
| `backend/migrations/` | SQL migration files (immutable) |
| `backend/tests/` | Unit, integration, performance tests |
| `frontend/mobile_app/` | Expo/React Native app |
| `frontend/web_portals/` | React/Vite web portals |
| `docs/` | All project documentation |
| `app/` | Expo app router screens |
