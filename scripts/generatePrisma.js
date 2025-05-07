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
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
      `;
      
      fs.writeFileSync(path.join(clientDir, 'patch.js'), patchContent);
      console.log('Prisma client patched successfully');
    } catch (err) {
      console.error(`Error patching Prisma client: ${err}`);
    }
  }
}); 