#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# Check-CC 本地热部署脚本
# 作用：停止旧服务 -> 安装依赖 -> 编译项目 -> 启动热更新服务
# 默认端口：7865，可通过 PORT=7534 ./shell/deploy-restart-hot.sh 覆盖
# =============================================================

# 项目根目录：脚本在 shell/ 下，所以向上一级就是项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 本地部署端口，不使用 3000/4000 这类默认端口，避免和其他项目冲突
PORT="${PORT:-7865}"

# 监听 0.0.0.0，方便同一局域网内的手机、平板、电脑访问
HOST="${HOST:-0.0.0.0}"

# 运行状态文件和日志文件放到项目外，避免 Next dev 监听日志变化后反复刷新页面
RUNTIME_DIR="${TMPDIR:-/tmp}/check-cc"
PID_FILE="$RUNTIME_DIR/dev.pid"
LOG_FILE="$RUNTIME_DIR/dev.log"

cd "$ROOT_DIR"
mkdir -p "$RUNTIME_DIR"

# 获取本机局域网 IP，用于启动成功后打印访问地址
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

# 停止当前端口上的旧服务，确保重新部署时端口干净
echo "[Check-CC] 正在停止端口 $PORT 上的旧服务"
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:"$PORT" || true)"
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill 2>/dev/null || true
    sleep 1
    PIDS="$(lsof -ti tcp:"$PORT" || true)"
    if [ -n "$PIDS" ]; then
      echo "$PIDS" | xargs kill -9 2>/dev/null || true
    fi
  fi
fi

# 根据上次记录的 PID 再清理一次，避免后台服务残留
if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

# 安装或补齐依赖。node_modules 存在时跳过安装，避免每次启动都被 pnpm 安全策略卡住
echo "[Check-CC] 正在检查依赖"
if [ ! -x "$ROOT_DIR/node_modules/.bin/next" ]; then
  echo "[Check-CC] 未检测到 Next.js 本地依赖，开始安装"
  pnpm install
else
  echo "[Check-CC] 依赖已存在，跳过安装"
fi

# 清理上一次异常退出留下的 Next 构建锁，避免误判还有 build 进程
rm -f "$ROOT_DIR/.next/lock" "$ROOT_DIR/.next/cache/lock" 2>/dev/null || true

# 先编译一次，提前暴露 TypeScript / Next.js 构建问题
echo "[Check-CC] 正在编译项目"
"$ROOT_DIR/node_modules/.bin/next" build

# 启动 Next.js dev 服务，保留热更新能力，适合本地开发部署
# Next.js 16 默认 Turbopack 在当前项目会反复触发 HMR 刷新，使用 webpack 避免无限刷新
echo "[Check-CC] 正在启动本地热部署服务，端口 $PORT"
nohup "$ROOT_DIR/node_modules/.bin/next" dev --webpack --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

sleep 3

# 检查服务是否启动成功，失败时打印最近日志
if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "[Check-CC] 启动失败，日志位置：$LOG_FILE"
  tail -n 80 "$LOG_FILE" || true
  exit 1
fi

# 打印本地和局域网访问地址，方便手机/平板/电脑一起测试
echo ""
echo "[Check-CC] 本地热部署启动成功"
echo "PID: $(cat "$PID_FILE")"
echo "端口: $PORT"
echo "本机地址: http://localhost:$PORT"
echo "本机地址: http://127.0.0.1:$PORT"

IPS="$(local_ips | awk 'NF && !seen[$0]++')"
if [ -n "$IPS" ]; then
  echo "局域网地址:"
  while IFS= read -r ip; do
    [ -n "$ip" ] && echo "  http://$ip:$PORT"
  done <<< "$IPS"
else
  echo "局域网地址: 未检测到局域网 IP"
fi

echo "日志文件: $LOG_FILE"
