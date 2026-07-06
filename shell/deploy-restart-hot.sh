#!/usr/bin/env bash
set -euo pipefail

# CheckCC local dev restart script
# Usage: PORT=7865 ./shell/deploy-restart-hot.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-7865}"
HOST="${HOST:-0.0.0.0}"
RUNTIME_DIR="${TMPDIR:-/tmp}/checkcc"
PID_FILE="$RUNTIME_DIR/dev.pid"
LOG_FILE="$RUNTIME_DIR/dev.log"

cd "$ROOT_DIR"
mkdir -p "$RUNTIME_DIR"

local_ips() {
  if command -v ipconfig >/dev/null 2>&1; then
    for iface in en0 en1; do
      ipconfig getifaddr "$iface" 2>/dev/null || true
    done
  fi
  if command -v ifconfig >/dev/null 2>&1; then
    ifconfig 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" {print $2}' || true
  fi
}

echo "[CheckCC] stopping old service on port $PORT"
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:"$PORT" || true)"
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill 2>/dev/null || true
    sleep 1
    PIDS="$(lsof -ti tcp:"$PORT" || true)"
    [ -n "$PIDS" ] && echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
fi

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

echo "[CheckCC] checking dependencies"
if [ ! -x "$ROOT_DIR/node_modules/.bin/next" ]; then
  pnpm install
fi

rm -f "$ROOT_DIR/.next/lock" "$ROOT_DIR/.next/cache/lock" 2>/dev/null || true

echo "[CheckCC] building project"
"$ROOT_DIR/node_modules/.bin/next" build

echo "[CheckCC] starting dev server on port $PORT"
nohup "$ROOT_DIR/node_modules/.bin/next" dev --webpack --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

sleep 3

if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "[CheckCC] failed to start, log: $LOG_FILE"
  tail -n 80 "$LOG_FILE" || true
  exit 1
fi

echo ""
echo "[CheckCC] dev server started"
echo "PID: $(cat "$PID_FILE")"
echo "Local: http://localhost:$PORT"
echo "Local: http://127.0.0.1:$PORT"

IPS="$(local_ips | awk 'NF && !seen[$0]++')"
if [ -n "$IPS" ]; then
  echo "LAN:"
  while IFS= read -r ip; do
    [ -n "$ip" ] && echo "  http://$ip:$PORT"
  done <<< "$IPS"
fi

echo "Log: $LOG_FILE"
