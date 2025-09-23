import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient().$extends(withAccelerate())
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient().$extends(withAccelerate())
  }
  prisma = global.prisma
}

export default prisma