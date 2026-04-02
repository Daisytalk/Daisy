import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/shared/lib/database'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { FreedomPayStubService, FREEDOM_PAY_STUB_PREFIX } from '@/shared/services/freedompay'

export const dynamic = 'force-dynamic'

/** Верхняя граница суммы в минорных единицах (например центах USD) — защита от подделки. */
const MAX_AMOUNT_MINOR = 10_000_000 // 100 000 USD при центах

export async function POST(request: NextRequest) {
  const decoded = getVerifiedAuthFromRequest(request)
  if (!decoded) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 })
  }

  let body: { paymentId?: unknown; amountMinor?: unknown; currency?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Некорректный JSON' }, { status: 400 })
  }

  const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : ''
  const amountMinor = Number(body.amountMinor)
  const rawCur = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : 'USD'
  const currency = /^[A-Z]{3}$/.test(rawCur) ? rawCur : 'USD'

  if (!paymentId || !Number.isFinite(amountMinor) || amountMinor <= 0 || amountMinor > MAX_AMOUNT_MINOR) {
    return NextResponse.json({ message: 'Некорректные данные платежа' }, { status: 400 })
  }

  const existing = await prisma.payment.findUnique({ where: { externalId: paymentId } })
  if (existing) {
    return NextResponse.json({ ok: true, alreadyRecorded: true })
  }

  const service = new FreedomPayStubService()
  const status = await service.getPaymentStatus(paymentId)
  if (status.status !== 'approved') {
    return NextResponse.json({ message: 'Платёж не подтверждён' }, { status: 400 })
  }

  if (!paymentId.startsWith(FREEDOM_PAY_STUB_PREFIX)) {
    return NextResponse.json({ message: 'Неподдерживаемый идентификатор платежа' }, { status: 400 })
  }

  const rounded = Math.round(amountMinor)

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          userId: decoded.userId,
          amountMinor: rounded,
          currency,
          provider: 'freedompay',
          externalId: paymentId,
        },
      })
      await tx.user.update({
        where: { id: decoded.userId },
        data: { subscriptionStatus: 'active' },
      })
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ ok: true, alreadyRecorded: true })
    }
    console.error('record-success payment', e)
    return NextResponse.json({ message: 'Не удалось сохранить платёж' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
