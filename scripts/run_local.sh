#!/bin/bash
# run_local.sh - Run VerdaTraceAI locally on Unix/macOS/Git Bash

# 1. Kill any existing ports (8000 for FastAPI, 5173 for Vite)
ports=(8000 5173)
for port in "${ports[@]}"; do
  pid=$(lsof -t -i:"$port" 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Found active process on port $port (PID: $pid). Terminating..."
    kill -9 $pid 2>/dev/null || true
  fi
done

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 2. Start Backend FastAPI Server
echo "Starting FastAPI Backend on port 8000..."
cd backend
python3 -m app.main &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# 3. Start Frontend Vite Server
echo "Starting Vite Frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

echo "Both services launched successfully in the background!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Trap interrupt signal to cleanly exit both processes on Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
