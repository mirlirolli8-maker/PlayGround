#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
: "${CAPTURE_URL:?CAPTURE_URL is required}" "${CAPTURE_DIR:?CAPTURE_DIR is required}" "${RUNTIME_DIR:?RUNTIME_DIR is required}"

run() {
  printf '[timing]'
  printf ' %q' "$@"
  printf '\n'
  /usr/bin/time -p "$@"
}

run mkdir -p "$CAPTURE_DIR"
run node "$RUNTIME_DIR/scripts/default-capture.mjs"
