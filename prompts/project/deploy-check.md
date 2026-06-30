# Deployment Health Check Template

## Task
Verify all deployed portals are healthy after a change.

## Checks

### 1. Backend API
```bash
echo "=== Backend Health ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://vol-rewards-api.onrender.com/api/health
echo "---"
curl -s https://vol-rewards-api.onrender.com/api/health | head -5
```

### 2. Web Portals
```bash
echo "=== Admin Portal ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://webportals-lovat.vercel.app/admin/login

echo "=== Organiser Portal ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://webportals-lovat.vercel.app/organiser

echo "=== Merchant Portal ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://webportals-lovat.vercel.app/merchant

echo "=== Scanner PWA ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://webportals-lovat.vercel.app/scan

echo "=== Volunteer PWA ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://volunteering-rewards-app.vercel.app/home
```

### 3. Login Test (all 4 roles)
```bash
for role in carol@test.com bob@test.com cheryl@test.com alice@test.com; do
  echo -n "$role: "
  curl -s -X POST https://vol-rewards-api.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$role\",\"password\":\"password123\"}" | \
    node -e "process.stdin.on('data',d=>{const r=JSON.parse(d);console.log(r.success?'OK':'FAIL')})"
done
```

### 4. Database Connection
```bash
echo "=== DB Check ==="
curl -s https://vol-rewards-api.onrender.com/api/debug/db | head -10
```

### 5. Report
```markdown
| Portal | Status | Notes |
|--------|--------|-------|
| Backend API | ✅/❌ | |
| Admin Portal | ✅/❌ | |
| Organiser Portal | ✅/❌ | |
| Merchant Portal | ✅/❌ | |
| Scanner PWA | ✅/❌ | |
| Volunteer PWA | ✅/❌ | |
| Login (Admin) | ✅/❌ | |
| Login (Organiser) | ✅/❌ | |
| Login (Merchant) | ✅/❌ | |
| Login (Volunteer) | ✅/❌ | |
| Database | ✅/❌ | |
```
