#!/bin/bash
BASE="http://localhost:3000"

AT=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"carol@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch(e){console.log('FAIL')}})")
VT=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch(e){console.log('FAIL')}})")
OT=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"johnny@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch(e){console.log('FAIL')}})")
MT=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"cheryl@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch(e){console.log('FAIL')}})")

echo "=== Fix 1: Volunteer Browse Events ==="
echo -n "  "; curl -s "$BASE/api/events?page=1&limit=5" -H "Authorization: Bearer $VT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);const n=j.events?.length;if(n>0)console.log('PASS: '+n+' events returned');else console.log('FAIL: 0 events')}catch(e){console.log('FAIL: '+e.message)}})"

echo "=== Fix 2: Volunteer Redeem Reward ==="
RWID=$(curl -s "$BASE/api/rewards" -H "Authorization: Bearer $VT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data?.[0]?.id)}catch(e){console.log('')}})")
echo -n "  Reward ID: $RWID -> "
curl -s -X POST "$BASE/api/rewards/$RWID/redeem" -H "Authorization: Bearer $VT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);const p=j.data?.pin||j.pin;if(p)console.log('PASS: PIN='+p);else console.log('FAIL: '+JSON.stringify(j).substring(0,100))}catch(e){console.log('FAIL: '+e.message)}})"

echo "=== Fix 3: Attendance Scan + Duplicate Check ==="
EID=$(curl -s -X POST "$BASE/api/organiser/events" -H "Authorization: Bearer $OT" -H "Content-Type: application/json" -d '{"title":"Verify Fix","location":"T","event_date":"2026-07-25","capacity":10,"points_value":50,"category":"Community"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data?.id)}catch(e){console.log('')}})")
echo "  Event ID: $EID"
curl -s -X POST "$BASE/api/events/$EID/register" -H "Authorization: Bearer $VT" > /dev/null && echo "  Joined event"
QR=$(curl -s "$BASE/api/me/qr-code" -H "Authorization: Bearer $VT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).qr_code)}catch(e){console.log('')}})")
[ -n "$QR" ] && echo "  QR: $QR" || echo "  QR: empty!"
S1=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/attendance/scan" -H "Authorization: Bearer $OT" -H "Content-Type: application/json" -d "{\"event_id\":$EID,\"qr_code_value\":\"$QR\"}")
echo -n "  First scan: HTTP $S1 -> "
S2=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/attendance/scan" -H "Authorization: Bearer $OT" -H "Content-Type: application/json" -d "{\"event_id\":$EID,\"qr_code_value\":\"$QR\"}")
echo -n "Duplicate: HTTP $S2 -> "
if [ "$S1" = "201" ] && [ "$S2" = "409" ]; then echo "PASS"; else echo "FAIL (expected 201,409 got $S1,$S2)"; fi

echo ""
echo "=== Summary ==="
echo "Fix 1 (Event List): Verified above"
echo "Fix 2 (Reward Redeem): Verified above"
echo "Fix 3 (Attendance Scan): Verified above"
