// Prisma Client constructor workaround
// This file is included in the Next.js config to fix Prisma issues

// Set environment variables needed by Prisma
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

// Export empty object as this is used as a module
module.exports = {}; 