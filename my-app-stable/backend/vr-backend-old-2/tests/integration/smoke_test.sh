#!/bin/bash
#-------------------------------------------------------------------------
# INTEGRATION SMOKE TEST — Quick API Health Check
# Purpose: Verify all core API endpoints respond correctly
# Run:     bash tests/integration/smoke_test.sh
#-------------------------------------------------------------------------

BASE="http://localhost:3000/api"
PASS=0
FAIL=0

green() { echo -e "\033[32m$1\033[0m"; }
red()   { echo -e "\033[31m$1\033[0m"; }

echo "============================================"
echo "  Smoke Test — $(date)"
echo "============================================"

# IT-01: Health Check
echo -n "IT-01 Health Check ... "
HEALTH=$(curl -s $BASE/health)
if echo "$HEALTH" | grep -q '"ok"'; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# Login as Admin
echo -n "Admin Login .......... "
LOGIN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}')
TOKEN=$(echo "$LOGIN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token||''))")
if [ -n "$TOKEN" ]; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# IT-02: Admin Dashboard
echo -n "IT-02 Admin Dashboard . "
DASH=$(curl -s $BASE/admin/dashboard -H "Authorization: Bearer $TOKEN")
if echo "$DASH" | grep -q "total_users"; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# IT-03: List Users
echo -n "IT-03 List Users ..... "
USERS=$(curl -s "$BASE/admin/users?limit=5" -H "Authorization: Bearer $TOKEN")
if echo "$USERS" | grep -q '"data"'; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# IT-04: List Coupons
echo -n "IT-04 List Coupons ... "
COUPONS=$(curl -s "$BASE/admin/coupons?limit=5" -H "Authorization: Bearer $TOKEN")
if echo "$COUPONS" | grep -q '"data"'; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# IT-05: Rewards Config
echo -n "IT-05 Rewards Config . "
CONFIG=$(curl -s "$BASE/admin/rewards/configuration" -H "Authorization: Bearer $TOKEN")
if echo "$CONFIG" | grep -q "points_per_dollar"; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# Login as Volunteer
echo -n "Volunteer Login ..... "
VLOGIN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}')
VTOKEN=$(echo "$VLOGIN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token||''))")
if [ -n "$VTOKEN" ]; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# IT-06: Browse Events
echo -n "IT-06 Browse Events . "
EVENTS=$(curl -s "$BASE/events?limit=5" -H "Authorization: Bearer $VTOKEN")
if echo "$EVENTS" | grep -q '"events"'; then
  green "PASS"
  ((PASS++))
else
  red "FAIL"
  ((FAIL++))
fi

# Role Guard Test (Volunteer accessing admin)
echo -n "Role Guard Test ..... "
BLOCKED=$(curl -s "$BASE/admin/coupons" -H "Authorization: Bearer $VTOKEN")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/coupons" -H "Authorization: Bearer $VTOKEN")
if [ "$HTTP_CODE" = "403" ]; then
  green "PASS"
  ((PASS++))
else
  red "FAIL (got $HTTP_CODE)"
  ((FAIL++))
fi

echo ""
echo "============================================"
echo "  Results: $PASS passed, $FAIL failed"
echo "============================================"
exit $FAIL
