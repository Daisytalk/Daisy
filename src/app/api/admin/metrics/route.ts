import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { verifyAdminSession } from '@/shared/lib/admin-auth'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

export const dynamic = 'force-dynamic'

const SOURCE_LABELS: Record<string, string> = {
  unknown: 'Не указано',
  direct: 'Прямой заход',
  referral: 'Переход по ссылке',
  instagram: 'Instagram',
  vk: 'ВКонтакте',
  telegram: 'Telegram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  linkedin: 'LinkedIn',
  ok: 'Одноклассники',
}

function labelForSource(source: string): string {
  return SOURCE_LABELS[source] ?? source
}

export async function GET(request: NextRequest) {
  if (!getVerifiedAuthFromRequest(request)) {
    return NextResponse.json(
      { message: 'Требуется вход в аккаунт', code: 'user_auth' },
      { status: 401 }
    )
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json(
      { message: 'Требуется секрет админки', code: 'admin_auth' },
      { status: 403 }
    )
  }

  try {
    const [totalUsers, usersStartedChat, totalUserMessages, payingUsersCount, paymentRowsCount, bySourceRaw, paymentTotalsRaw] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { cbtConversations: { some: {} } },
        }),
        prisma.cbtMessage.count({ where: { role: 'user' } }),
        prisma.user.count({
          where: { payments: { some: {} } },
        }),
        prisma.payment.count(),
        prisma.user.groupBy({
          by: ['acquisitionSource'],
          _count: { _all: true },
        }),
        prisma.payment.groupBy({
          by: ['currency'],
          _sum: { amountMinor: true },
        }),
      ])

    type SourceRow = { acquisitionSource: string | null; _count: { _all: number } }
    const bySource = (bySourceRaw as SourceRow[])
      .map((row) => ({
        sourceKey: row.acquisitionSource ?? 'unknown',
        label: labelForSource(row.acquisitionSource ?? 'unknown'),
        users: row._count._all,
      }))
      .sort((a, b) => b.users - a.users)

    type PayRow = { currency: string; _sum: { amountMinor: number | null } }
    const totalsByCurrency = (paymentTotalsRaw as PayRow[])
      .map((row) => ({
        currency: row.currency,
        amountMinor: row._sum.amountMinor ?? 0,
      }))
      .filter((r) => r.amountMinor > 0)
      .sort((a, b) => b.amountMinor - a.amountMinor)

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      totalUsers,
      usersStartedChat,
      totalUserMessages,
      payingUsersCount,
      paymentsTransactionsCount: paymentRowsCount,
      totalsByCurrency,
      bySource,
    })
  } catch (e) {
    console.error('admin metrics', e)
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
