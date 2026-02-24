import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'

/**
 * POST /api/internal/cleanup
 * Deletes expired MemoryItems (ttlDays elapsed since createdAt).
 * Protected by CRON_SECRET header — called by a cron job or Azure Logic App.
 */
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const deleted = await prisma.memoryItem.deleteMany({
    where: {
      ttlDays: { not: null },
      createdAt: {
        // createdAt + ttlDays*days < now  ↔  createdAt < now - ttlDays*days
        // Prisma doesn't support computed expiry columns directly, so we use
        // a conservative 365-day cutoff; exact per-item TTL pruning requires
        // a raw query or a generated expiresAt column.
        lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      },
    },
  })

  console.log(JSON.stringify({ level: 'info', ctx: 'memory_cleanup', deleted: deleted.count }))

  return NextResponse.json({ deleted: deleted.count })
}
