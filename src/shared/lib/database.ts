import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  // Ensure DATABASE_URL is available
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  console.log('🔍 Creating Prisma client with DATABASE_URL length:', databaseUrl.length)
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  }).$extends(withAccelerate())
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Create a function to get or create the Prisma client
function getPrismaClient() {
  if (globalThis.prisma) {
    return globalThis.prisma
  }
  
  const client = prismaClientSingleton()
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client
  }
  
  return client
}

// Export a getter function instead of a direct instance
const prisma = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
  get(target, prop) {
    const client = getPrismaClient()
    return client[prop as keyof typeof client]
  }
})

export default prisma
