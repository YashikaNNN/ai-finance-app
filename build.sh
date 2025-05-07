#!/bin/bash
export PRISMA_LOG_LEVEL=warn
export PRISMA_ENGINE_TYPE=library

# Install dependencies
npm install --legacy-peer-deps || exit 1

# Install required packages for build
npm install tailwindcss postcss autoprefixer eslint eslint-config-next prisma --no-save || exit 1

# Generate Prisma client
npx prisma generate || exit 1

# Build the Next.js app
NEXT_TELEMETRY_DISABLED=1 next build || exit 1

echo "Build completed successfully" 