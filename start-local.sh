#!/usr/bin/env bash
#
# Start the full CourseCraft stack locally (MongoDB + NLP + API + frontend).
#
#   ./start-local.sh          start everything
#   ./start-local.sh stop     stop everything
#
# Ports (overridable via env):
#   MONGO_PORT=27017   local MongoDB
#   NLP_PORT=3011      Python Flask / Gemini service
#   API_PORT=3010      Node/Express API
#   WEB_PORT=5173      Vite dev server
#
# NOTE: ports 3000 and 3001 are intentionally avoided because they are often
# already taken by other local projects. Set API_PORT / NLP_PORT to match
# server/config.env (NLP_URL) if you change them.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONGO_PORT="${MONGO_PORT:-27017}"
NLP_PORT="${NLP_PORT:-3011}"
API_PORT="${API_PORT:-3010}"
WEB_PORT="${WEB_PORT:-5173}"
LOG_DIR="${ROOT}/.logs"
MONGO_URI="mongodb://127.0.0.1:${MONGO_PORT}/CourseCraft"

mkdir -p "${LOG_DIR}"

log() { printf '\033[36m▸\033[0m %s\n' "$1"; }
ok()  { printf '\033[32m✔\033[0m %s\n' "$1"; }
err() { printf '\033[31m✖\033[0m %s\n' "$1"; }

stop() {
  log "Stopping CourseCraft services…"
  pkill -f "scripts/dev-mongo.mjs" 2>/dev/null || true
  # The mongod child of mongodb-memory-server keeps the data dir locked.
  pkill -f "mongo-data" 2>/dev/null || true
  pkill -f "api\.py" 2>/dev/null || true
  pkill -f "node server\.js" 2>/dev/null || true
  pkill -f "vite/bin/vite\.js" 2>/dev/null || true
  sleep 2
  ok "Stopped."
  exit 0
}

[ "${1:-start}" = "stop" ] && stop

# --------------------------------------------------------------- 1. MongoDB
if lsof -iTCP:"${MONGO_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  ok "MongoDB already listening on :${MONGO_PORT}"
else
  log "Starting local MongoDB on :${MONGO_PORT} (first run downloads a mongod binary)…"
  (cd "${ROOT}/server" && npm run mongo:dev) > "${LOG_DIR}/mongo.log" 2>&1 </dev/null &
  for _ in $(seq 1 150); do
    lsof -iTCP:"${MONGO_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 && break
    sleep 1
  done
  lsof -iTCP:"${MONGO_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 \
    && ok "MongoDB ready on :${MONGO_PORT}" \
    || { err "MongoDB failed to start — see ${LOG_DIR}/mongo.log"; exit 1; }
fi

# ------------------------------------------------------- 2. NLP (Gemini)
if lsof -iTCP:"${NLP_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  ok "NLP service already listening on :${NLP_PORT}"
else
  log "Starting NLP service (Flask + Gemini) on :${NLP_PORT}…"
  (cd "${ROOT}/NLP" && NLP_PORT="${NLP_PORT}" venv/bin/python api.py) > "${LOG_DIR}/nlp.log" 2>&1 </dev/null &
  for _ in $(seq 1 30); do
    lsof -iTCP:"${NLP_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 && break
    sleep 1
  done
  lsof -iTCP:"${NLP_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 \
    && ok "NLP ready on :${NLP_PORT}" \
    || { err "NLP failed to start — see ${LOG_DIR}/nlp.log"; exit 1; }
fi

# --------------------------------------------------------- 3. Node API
if lsof -iTCP:"${API_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  ok "API already listening on :${API_PORT}"
else
  log "Starting Express API on :${API_PORT}…"
  (cd "${ROOT}/server" && \
    PORT="${API_PORT}" \
    NLP_URL="http://127.0.0.1:${NLP_PORT}" \
    DATABASE="${MONGO_URI}" \
    node server.js) > "${LOG_DIR}/api.log" 2>&1 </dev/null &
  for _ in $(seq 1 30); do
    lsof -iTCP:"${API_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 && break
    sleep 1
  done
  lsof -iTCP:"${API_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 \
    && ok "API ready on :${API_PORT}" \
    || { err "API failed to start — see ${LOG_DIR}/api.log"; exit 1; }
fi

# -------------------------------------------------------- 4. Frontend
cd "${ROOT}/client/vite-project"
if lsof -iTCP:"${WEB_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  ok "Frontend already listening on :${WEB_PORT}"
else
  log "Starting Vite dev server on :${WEB_PORT}…"
  printf 'VITE_API_URL=http://127.0.0.1:%s\n' "${API_PORT}" > .env
  (npm run dev -- --port "${WEB_PORT}") > "${LOG_DIR}/web.log" 2>&1 </dev/null &
  for _ in $(seq 1 40); do
    lsof -iTCP:"${WEB_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 && break
    sleep 1
  done
  lsof -iTCP:"${WEB_PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1 \
    && ok "Frontend ready on :${WEB_PORT}" \
    || { err "Frontend failed to start — see ${LOG_DIR}/web.log"; exit 1; }
fi

cat <<BANNER

  CourseCraft is running.

    Frontend   http://localhost:${WEB_PORT}
    API        http://127.0.0.1:${API_PORT}/api/user
    NLP        http://127.0.0.1:${NLP_PORT}
    MongoDB    ${MONGO_URI}

    Test login   testuser@example.com / Test@12345
    Logs          ${LOG_DIR}/
    Stop          ./start-local.sh stop

BANNER
