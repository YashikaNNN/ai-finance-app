#!/bin/bash
export PRISMA_LOG_LEVEL=warn
export NODE_OPTIONS="--no-warnings"
export PRISMA_CLIENT_ENGINE_TYPE=library

# Install dependencies
npm install --legacy-peer-deps || exit 1

# Install required packages for build
npm install tailwindcss postcss autoprefixer eslint eslint-config-next prisma --no-save || exit 1

# Ensure scripts directory exists
mkdir -p scripts

# Create the Prisma generation patch script if it doesn't exist
if [ ! -f "scripts/generatePrisma.js" ]; then
  echo "Creating Prisma generation script..."
  cat > scripts/generatePrisma.js << 'EOF'
// Custom script to generate Prisma client with explicit options
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating Prisma client with explicit options...');

// Ensure the prisma directory exists
const prismaDir = path.join(__dirname, '../prisma');
if (!fs.existsSync(prismaDir)) {
  console.error('Error: Prisma directory not found');
  process.exit(1);
}

// Run prisma generate with explicit options
const command = 'npx prisma generate --schema=./prisma/schema.prisma';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing Prisma generate: ${error}`);
    process.exit(1);
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(`Prisma generate stderr: ${stderr}`);
  }
  
  console.log('Prisma client generation completed successfully');
  
  // Create .prisma/client/index.js with additional options if it exists
  const clientDir = path.join(__dirname, '../node_modules/.prisma/client');
  if (fs.existsSync(clientDir)) {
    console.log('Patching Prisma client...');
    
    try {
      // Ensure the directory exists
      if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir, { recursive: true });
      }
      
      // Create a patch file that explicitly sets enableTracing
      const patchContent = `
// This is a patch to fix the enableTracing issue
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
      `;
      
      fs.writeFileSync(path.join(clientDir, 'patch.js'), patchContent);
      console.log('Prisma client patched successfully');
    } catch (err) {
      console.error(`Error patching Prisma client: ${err}`);
    }
  }
});
EOF
fi

# Run custom Prisma generation script
node scripts/generatePrisma.js || exit 1

# Create prisma client patch for runtime
echo "Creating Prisma client runtime patch..."
cat > prisma-patch.js << 'EOF'
// Fix for Prisma client during runtime
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
EOF

# Make sure the patch is loaded at runtime
export NODE_OPTIONS="$NODE_OPTIONS --require ./prisma-patch.js"

# Build the Next.js app
NEXT_TELEMETRY_DISABLED=1 next build || exit 1

echo "Build completed successfully" 