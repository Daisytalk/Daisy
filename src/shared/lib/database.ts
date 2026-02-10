import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

declare global {
  var prismaGlobal: ExtendedPrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    // Don't throw at import time — let route handlers catch the error and return JSON
    console.error('❌ DATABASE_URL is not set! Database queries will fail.')
  }

  const client = new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  return client.$extends(withAccelerate())
}

function getPrismaClient(): ExtendedPrismaClient {
  if (process.env.NODE_ENV === 'production') {
    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = createPrismaClient()
    }
    return globalThis.prismaGlobal
  }

  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient()
  }

  return globalThis.prismaGlobal
}

const prisma = getPrismaClient()

export default prisma

export async function disconnectPrisma() {
  if (globalThis.prismaGlobal) {
    await globalThis.prismaGlobal.$disconnect()
    globalThis.prismaGlobal = undefined
  }
}
