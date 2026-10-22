#!/usr/bin/env bash
#
# Production entry point used by Render.
#
# Render's free tier gives a project 750 service-hours per month in total.
# Two always-on web services would need ~1440 hours, so the API and the NLP
# service run inside ONE container and share its single public URL:
#
#   public  ->  Express API      (0.0.0.0:$PORT)   <- the only exposed port
#   private ->  Flask NLP        (127.0.0.1:$NLP_PORT)
#
# The Express API proxies to the NLP service over NLP_URL.

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

export NLP_PORT="${NLP_PORT:-3001}"
export PORT="${PORT:-10000}"

if [ -z "${DATABASE:-}" ] && [ -z "${MONGODB_URI:-}" ]; then
  echo "FATAL: set DATABASE (or MONGODB_URI) in the service environment." >&2
  exit 1
fi

if [ -z "${GOOGLE_API_KEY:-}" ]; then
  echo "FATAL: set GOOGLE_API_KEY in the service environment." >&2
  exit 1
fi

echo "Starting NLP service on 127.0.0.1:${NLP_PORT}"
(
  cd NLP
  exec python3 -m gunicorn \
    --bind "127.0.0.1:${NLP_PORT}" \
    --workers 1 \
    --timeout 180 \
    --graceful-timeout 30 \
    --access-logfile - \
    api:app
) &
NLP_PID=$!

# Wait until Flask is actually accepting connections before the API starts
# proxying to it.
for _ in $(seq 1 30); do
  if (exec 3<>"/dev/tcp/127.0.0.1/${NLP_PORT}") 2>/dev/null; then
    exec 3<&- 3>&-
    echo "NLP service is up."
    break
  fi
  sleep 1
done

echo "Starting API service on 0.0.0.0:${PORT}"
(
  cd server
  exec node server.js
) &
API_PID=$!

shutdown() {
  echo "Shutting down..."
  kill -TERM "$NLP_PID" "$API_PID" 2>/dev/null || true
}
trap shutdown SIGTERM SIGINT

# Exit as soon as either process dies, so Render can restart the whole
# container instead of serving a half-working stack.
while kill -0 "$NLP_PID" 2>/dev/null && kill -0 "$API_PID" 2>/dev/null; do
  sleep 1
done
shutdown
