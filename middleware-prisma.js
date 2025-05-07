// This file runs before any middleware in the app
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

export { default } from './middleware'; 