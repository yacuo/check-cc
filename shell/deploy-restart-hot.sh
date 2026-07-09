#!/usr/bin/env bash
set -euo pipefail

# CheckCC local development restart script.
# CheckCC 本地开发重启脚本。
#
# Usage / 用法:
#   PORT=7865 ./shell/deploy-restart-hot.sh
#
# Environment / 环境变量:
#   PORT       Server port. Default: 7865
#              服务端口，默认 7865。
#   HOST       Bind host. Default: 0.0.0.0
#              监听地址，默认 0.0.0.0。
#   LOG_DIR    Runtime log directory. Default: ./logs/dev
#              运行日志目录，默认 ./logs/dev。

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-7865}"
HOST="${HOST:-0.0.0.0}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs/dev}"
PID_FILE="$LOG_DIR/checkcc-dev.pid"
LOG_FILE="$LOG_DIR/checkcc-dev.log"

cd "$ROOT_DIR"
mkdir -p "$LOG_DIR"

log() {
  printf '[CheckCC] %s\n' "$1"
}

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

stop_existing_server() {
  log "Stopping existing service on port $PORT / 停止端口 $PORT 上的旧服务"

  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$PORT" || true)"
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill 2>/dev/null || true
      sleep 1
      pids="$(lsof -ti tcp:"$PORT" || true)"
      [ -n "$pids" ] && echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
  fi

  if [ -f "$PID_FILE" ]; then
    local old_pid
    old_pid="$(cat "$PID_FILE" || true)"
    if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
      kill "$old_pid" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
}

ensure_dependencies() {
  log "Checking dependencies / 检查依赖"
  if [ ! -x "$ROOT_DIR/node_modules/.bin/next" ]; then
    pnpm install
  fi
}

start_server() {
  rm -f "$ROOT_DIR/.next/lock" "$ROOT_DIR/.next/cache/lock" 2>/dev/null || true

  log "Building project / 构建项目"
  "$ROOT_DIR/node_modules/.bin/next" build

  log "Starting dev server on port $PORT / 启动开发服务，端口 $PORT"
  nohup "$ROOT_DIR/node_modules/.bin/next" dev --webpack --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
}

print_section() {
  echo ""
  echo "========== $1 =========="
}

print_item() {
  printf '  %-18s %s\n' "$1" "$2"
}

print_startup_info() {
  local pid
  pid="$(cat "$PID_FILE")"

  local ips
  ips="$(local_ips | awk 'NF && !seen[$0]++')"

  echo ""
  log "Dev server started / 开发服务已启动"

  print_section "服务信息 / Service"
  print_item "项目 / Project" "CheckCC"
  print_item "状态 / Status" "已启动 / Started"
  print_item "进程 / PID" "$pid"
  print_item "端口 / Port" "$PORT"
  print_item "监听 / Host" "$HOST"

  print_section "访问地址 / Visit URLs"
  print_item "本机 / Local" "http://localhost:$PORT"
  print_item "本机 / Local" "http://127.0.0.1:$PORT"

  if [ -n "$ips" ]; then
    while IFS= read -r ip; do
      [ -n "$ip" ] && print_item "局域网 / LAN" "http://$ip:$PORT"
    done <<< "$ips"
  else
    print_item "局域网 / LAN" "未检测到局域网地址 / No LAN address found"
  fi

  print_section "运行文件 / Runtime Files"
  print_item "日志 / Log" "$LOG_FILE"
  print_item "PID 文件" "$PID_FILE"
  echo ""
}

stop_existing_server
ensure_dependencies
start_server

sleep 3

if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  log "Failed to start / 启动失败"
  echo "Log file / 日志文件: $LOG_FILE"
  tail -n 80 "$LOG_FILE" || true
  exit 1
fi

print_startup_info
