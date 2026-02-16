#!/bin/sh

# Start collaboration server in background
node server/collab.js &
COLLAB_PID=$!

echo "Started collaboration server (PID: $COLLAB_PID)"

# Start Next.js
npm start

# Cleanup on exit
trap "kill $COLLAB_PID 2>/dev/null" EXIT
