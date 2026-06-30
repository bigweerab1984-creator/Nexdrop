#!/bin/bash
export BRAIN_PASSWORD=secret
npm run dev > dev_server_auth.log 2>&1 &
PID=$!
sleep 10

echo "Testing unauthorized..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/logs

echo "Testing authorized..."
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer secret" http://localhost:3000/api/logs

kill $PID
