#!/usr/bin/env bash
set -euo pipefail

# CheckCC 开源项目一键部署启动脚本。
#
# 这个脚本面向所有开源用户，适合第一次拉取项目后直接运行，也适合日常开发时重启服务。
# 它会自动进入项目根目录、创建日志目录、停止当前端口上的旧服务、安装缺失依赖、构建项目，
# 然后用 Next.js 开发服务启动 CheckCC，并在终端打印本机与局域网访问地址。
#
# 常用启动方式：
#   ./shell/deploy-restart-hot.sh
#
# 指定端口启动：
#   PORT=7865 ./shell/deploy-restart-hot.sh
#
# 可选环境变量：
#   PORT     服务端口，默认 7865。
#   HOST     监听地址，默认 0.0.0.0，方便同一局域网内设备访问。
#   LOG_DIR  运行日志目录，默认 ./logs/dev。
#
# 启动成功后请优先使用终端打印的访问地址；启动失败时请查看终端打印的日志文件路径。

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

print_step() {
  printf '\n[CheckCC] %s\n' "$1"
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
  print_step "1/4 检查并停止旧服务，释放端口 ${PORT}。"

  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$PORT" || true)"
    if [ -n "$pids" ]; then
      log "发现端口 ${PORT} 已被占用，正在停止旧进程: ${pids}"
      echo "$pids" | xargs kill 2>/dev/null || true
      sleep 1
      pids="$(lsof -ti tcp:"$PORT" || true)"
      if [ -n "$pids" ]; then
        log "旧进程未正常退出，执行强制停止: ${pids}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
      fi
    else
      log "端口 ${PORT} 未被占用，可以直接启动。"
    fi
  else
    log "未找到 lsof，跳过端口占用检查。"
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
  print_step "2/4 检查项目依赖。"
  if [ ! -x "$ROOT_DIR/node_modules/.bin/next" ]; then
    log "未检测到 Next.js 依赖，开始执行 pnpm install。"
    pnpm install
  else
    log "依赖已存在，跳过安装。"
  fi
}

start_server() {
  rm -f "$ROOT_DIR/.next/lock" "$ROOT_DIR/.next/cache/lock" 2>/dev/null || true

  print_step "3/4 构建 CheckCC 项目。"
  "$ROOT_DIR/node_modules/.bin/next" build

  print_step "4/4 启动 CheckCC 开发服务。"
  log "服务将监听 ${HOST}:${PORT}，后台日志写入 ${LOG_FILE}。"
  nohup "$ROOT_DIR/node_modules/.bin/next" dev --webpack --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
}

print_section() {
  echo ""
  echo "========== $1 =========="
}

print_item() {
  printf '%s\n' "$1"
  printf '%s\n' "$2"
}

print_startup_info() {
  local pid
  pid="$(cat "$PID_FILE")"

  local ips
  ips="$(local_ips | awk 'NF && !seen[$0]++')"

  echo ""
  log "CheckCC 已启动。下面是开源用户最常用的信息。"

  print_section "项目状态"
  print_item "项目" "CheckCC"
  print_item "运行状态" "已启动"
  print_item "进程 PID" "$pid"
  print_item "服务端口" "$PORT"
  print_item "监听地址" "$HOST"

  print_section "浏览器访问地址"
  print_item "本机访问" "http://localhost:${PORT}"
  print_item "备用本机访问" "http://127.0.0.1:${PORT}"

  if [ -n "$ips" ]; then
    while IFS= read -r ip; do
      [ -n "$ip" ] && print_item "局域网设备访问" "http://${ip}:${PORT}"
    done <<< "$ips"
  else
    print_item "局域网设备访问" "未检测到局域网地址"
  fi

  print_section "运行文件"
  print_item "启动日志" "$LOG_FILE"
  print_item "PID 文件" "$PID_FILE"

  print_section "常用操作"
  print_item "查看日志" "tail -f $LOG_FILE"
  print_item "重新启动" "./shell/deploy-restart-hot.sh"
  print_item "更换端口" "PORT=3000 ./shell/deploy-restart-hot.sh"
  echo ""
}

stop_existing_server
ensure_dependencies
start_server

sleep 3

if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  log "CheckCC 启动失败。请先查看下面的错误日志。"
  print_section "错误日志"
  tail -n 80 "$LOG_FILE" || true
  print_section "排查入口"
  print_item "完整日志" "$LOG_FILE"
  print_item "常见原因" "依赖安装失败、端口被占用、Node.js 版本过低"
  print_item "建议命令" "pnpm install && ./shell/deploy-restart-hot.sh"
  exit 1
fi

print_startup_info
