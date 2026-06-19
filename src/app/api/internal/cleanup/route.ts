import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'

const DEACTIVATION_RETENTION_DAYS = 30

/**
 * POST /api/internal/cleanup
 * - Hard-deletes users deactivated > 30 days (cascade via Prisma onDelete).
 * - Deletes expired MemoryItems (expiresAt or createdAt + ttlDays).
 * Protected by CRON_SECRET header.
 */
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const deactivatedCutoff = new Date(now.getTime() - DEACTIVATION_RETENTION_DAYS * 24 * 60 * 60 * 1000)

  const [deletedUsers, deletedByExpiresAt, legacyDeleted] = await Promise.all([
    prisma.user.deleteMany({
      where: {
        deactivatedAt: { not: null, lt: deactivatedCutoff },
      },
    }),
    prisma.memoryItem.deleteMany({
      where: {
        isPinned: false,
        expiresAt: { lt: now },
      },
    }),
    prisma.$executeRaw`
      DELETE FROM memory_items
      WHERE expires_at IS NULL
        AND ttl_days IS NOT NULL
        AND is_pinned = false
        AND created_at + (ttl_days * INTERVAL '1 day') < ${now}
    `,
  ])

  const memoryDeleted = deletedByExpiresAt.count + Number(legacyDeleted)

  console.log(
    JSON.stringify({
      level: 'info',
      ctx: 'internal_cleanup',
      deletedUsers: deletedUsers.count,
      deletedMemory: memoryDeleted,
    })
  )

  return NextResponse.json({
    deletedUsers: deletedUsers.count,
    deletedMemory: memoryDeleted,
  })
}
