# Debug API Error Template

## Symptom
What's going wrong? (e.g., "Login returns 500", "Events page is blank", "Seed command fails")

## Investigation

### 1. Check backend health
```bash
curl https://vol-rewards-api.onrender.com/api/health
# Or locally:
curl http://localhost:3000/api/health
```

### 2. Check database connection
```bash
curl https://vol-rewards-api.onrender.com/api/debug/db
```

### 3. Reproduce the error
```bash
# Login as the affected role
curl -s -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}'
```

### 4. Check recent migrations
```bash
cd backend && ls -la migrations/ | tail -5
cd backend && node -e "require('./src/config/db')"
```

### 5. Check backend logs
```bash
# Local
cd backend && node index.js 2>&1 | head -30

# Remote
curl https://vol-rewards-api.onrender.com/api/debug/db
```

### 6. Common fixes
- **42P01 (relation not found):** Run migrations → `cd backend && npm run migrate`
- **CORS error:** Check `backend/src/config/cors.js` and Vercel config
- **JWT expired:** Re-login to get a fresh token
- **ENOENT (upload missing):** Create `backend/uploads/` directory
- **ECONNREFUSED:** Database not running or wrong credentials in `.env`

### 7. Rollback if needed
```bash
# Reset local DB
cd backend && node src/utils/migrationRunner.js --down

# Re-migrate
cd backend && node src/utils/migrationRunner.js
```
