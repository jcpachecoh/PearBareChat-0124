#!/bin/bash

echo "current bare-pack version:"
./node_modules/.bin/bare-pack --version 2>/dev/null || node -e "console.log(require('./node_modules/bare-pack/package.json').version)"

# start compile bundles
./node_modules/.bin/bare-pack --out worklet/app.bundle.js worklet/app.mjs
