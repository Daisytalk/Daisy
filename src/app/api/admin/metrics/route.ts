import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { verifyAdminSession } from '@/shared/lib/admin-auth'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { resolveMetricsPeriod } from '@/shared/lib/admin-metrics-period'
import type { ResolvedMetricsPeriod } from '@/shared/lib/admin-metrics-period'

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

function dateRangeWhere(period: ResolvedMetricsPeriod): { gte: Date; lte: Date } | undefined {
  if (period.from === null) return undefined
  return { gte: period.from, lte: period.to }
}

export async function GET(request: NextRequest) {
  if (!(await getVerifiedAuthFromRequest(request))) {
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

  const resolved = resolveMetricsPeriod(request.nextUrl.searchParams)
  if (!resolved.ok) {
    return NextResponse.json({ message: resolved.message }, { status: 400 })
  }
  const period = resolved.period
  const dr = dateRangeWhere(period)

  try {
    if (!dr) {
      const [
        totalUsers,
        usersStartedChat,
        totalUserMessages,
        payingUsersCount,
        paymentRowsCount,
        bySourceRaw,
        paymentTotalsRaw,
      ] = await Promise.all([
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
        period: {
          preset: period.preset,
          from: null,
          to: period.to.toISOString(),
          label: period.labelRu,
        },
        updatedAt: new Date().toISOString(),
        totalUsers,
        usersStartedChat,
        totalUserMessages,
        payingUsersCount,
        paymentsTransactionsCount: paymentRowsCount,
        totalsByCurrency,
        bySource,
      })
    }

    const [
      totalUsers,
      convUsers,
      totalUserMessages,
      payUsers,
      paymentRowsCount,
      bySourceRaw,
      paymentTotalsRaw,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: dr },
      }),
      prisma.cbtConversation.groupBy({
        by: ['userId'],
        where: { createdAt: dr },
        _count: { _all: true },
      }),
      prisma.cbtMessage.count({
        where: { role: 'user', createdAt: dr },
      }),
      prisma.payment.groupBy({
        by: ['userId'],
        where: { createdAt: dr },
        _count: { _all: true },
      }),
      prisma.payment.count({
        where: { createdAt: dr },
      }),
      prisma.user.groupBy({
        by: ['acquisitionSource'],
        where: { createdAt: dr },
        _count: { _all: true },
      }),
      prisma.payment.groupBy({
        by: ['currency'],
        where: { createdAt: dr },
        _sum: { amountMinor: true },
      }),
    ])

    const usersStartedChat = convUsers.length
    const payingUsersCount = payUsers.length

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
      period: {
        preset: period.preset,
        from: period.from!.toISOString(),
        to: period.to.toISOString(),
        label: period.labelRu,
      },
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
