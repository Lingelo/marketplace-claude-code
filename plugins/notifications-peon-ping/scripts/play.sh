#!/usr/bin/env bash
# play.sh — Wrapper for PeonPing CLI
# Emits a sound event via `peon emit <event>`
# Graceful degradation: exits 0 silently if peon is not installed.
#
# Environment:
#   CESP_EVENT  — PeonPing event name (e.g. task.complete, input.required)

set -euo pipefail

# Bail silently if peon is not in PATH
if ! command -v peon &>/dev/null; then
  exit 0
fi

EVENT="${CESP_EVENT:-}"

if [ -z "$EVENT" ]; then
  exit 0
fi

# Emit the event via PeonPing
peon emit "$EVENT" 2>/dev/null || true

exit 0
