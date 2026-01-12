import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

declare global {
  var prismaGlobal: ExtendedPrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production')
    }
    console.warn('⚠️  DATABASE_URL not set, using dummy connection')
    return new PrismaClient().$extends(withAccelerate())
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
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
