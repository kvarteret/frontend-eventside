#!/bin/sh
set -eu

# Install deps on first container start if node_modules is missing.
if [ ! -d node_modules ]; then
  bun install --frozen-lockfile
fi

exec "$@"
