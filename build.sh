#!/bin/bash
set -euo pipefail

# Use the Prisma CLI already installed with this app.
# Do not npm-install prisma here — that was downloading a newer CLI than @prisma/client.
./node_modules/.bin/prisma generate
NEXT_TELEMETRY_DISABLED=1 ./node_modules/.bin/next build
