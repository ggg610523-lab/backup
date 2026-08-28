#!/bin/bash
set -e
cd "$(dirname "$0")"
export PATH="/tmp/node-v20.18.0-linux-x64/bin:$PATH"

if [ ! -d dist/renderer ] || [ "$1" = "--build" ]; then
  echo "Building..."
  npx webpack --config webpack.config.js --mode development 2>&1 | tail -5
  cp -r src/renderer/reversal-icons dist/renderer/reversal-icons 2>/dev/null || true
fi

exec npx electron .
