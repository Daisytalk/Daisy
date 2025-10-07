import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Type for the extended Prisma client with Accelerate
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

// Declare global type for development hot-reload prevention
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ExtendedPrismaClient | undefined
}

/**
 * Creates a new Prisma Client instance with Accelerate extension
 * This function is called only once per process (or per hot-reload in dev)
 */
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  // Validate DATABASE_URL exists
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    throw new Error(
      'DATABASE_URL is required. Please set it in your environment variables.'
    )
  }

  // Log client creation (useful for debugging connection issues)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔄 Creating new Prisma Client instance')
  }

  // Create base Prisma Client with configuration
  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

  // Extend with Accelerate for connection pooling and caching
  return client.$extends(withAccelerate())
}

/**
 * Get or create the singleton Prisma Client instance
 * In development: Reuses the same instance across hot-reloads
 * In production: Creates one instance per serverless function cold start
 */
function getPrismaClient(): ExtendedPrismaClient {
  // In production, always create a new client (serverless best practice)
  // Each Lambda/serverless function gets its own instance
  if (process.env.NODE_ENV === 'production') {
    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = createPrismaClient()
    }
    return globalThis.prismaGlobal
  }

  // In development, reuse the same client to prevent connection exhaustion
  // This prevents creating new clients on every hot-reload
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient()
  }

  return globalThis.prismaGlobal
}

// Create the singleton instance
const prisma = getPrismaClient()

// Export the Prisma client instance
export default prisma

/**
 * Graceful shutdown helper for serverless environments
 * Call this in your shutdown hooks if needed
 */
export async function disconnectPrisma() {
  if (globalThis.prismaGlobal) {
    await globalThis.prismaGlobal.$disconnect()
    globalThis.prismaGlobal = undefined
  }
}
