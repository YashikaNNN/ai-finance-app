import { PrismaClient } from '@prisma/client'

// Reuse one client in development so hot reload does not open new connections.
const globalForPrisma = global

const prisma = globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = prisma
export default prisma
