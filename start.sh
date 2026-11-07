#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
PORT="${PORT:-3000}"
[[ "$PORT" =~ ^[0-9]+$ ]] && (( PORT > 0 && PORT < 65536 )) || { echo "Invalid PORT: $PORT" >&2; exit 1; }

run() {
  printf '[timing]'
  printf ' %q' "$@"
  printf '\n'
  /usr/bin/time -p "$@"
}

run mkdir -p "${OPENCODE_WEB_DIR:?OPENCODE_WEB_DIR is required}"
run node -e 'const fs=require("node:fs"); const p=process.argv[1]; const d=process.argv[2]; fs.writeFileSync(p, JSON.stringify({project:process.cwd(), directory:d}));' "$OPENCODE_WEB_DIR/deployment-output.json" "$PROJECT_DIR/dist"
if [[ -f package-lock.json ]]; then
  run npm ci --no-audit --no-fund
else
  run npm install --no-audit --no-fund
fi
run npm run build
export PORT
run node "$PROJECT_DIR/node_modules/vite/bin/vite.js" preview --host 0.0.0.0 --port "$PORT" --strictPort
