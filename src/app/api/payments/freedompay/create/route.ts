import { NextRequest, NextResponse } from 'next/server'
import { FreedomPayStubService } from '@/shared/services/freedompay'

/**
 * Заглушка: создание платежа Freedom Pay.
 * Документация: https://docs.freedompay.kz (Merchant API / Purchase / Create payment)
 *
 * Принимает:
 *   planId: string          — идентификатор плана (month_1, month_3, month_6)
 *   amount: number          — сумма в центах
 *   currency: string        — валюта (USD по умолчанию)
 *   description: string     — описание платежа
 *   durationMonths: number  — длительность подписки в месяцах
 *   returnUrl: string       — URL для возврата после оплаты
 *   recurrent: boolean      — рекуррентный платёж
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const planId = (body.planId as string) || 'unknown'
    const amount = Number(body.amount) || 0
    const currency = (body.currency as string) || 'USD'
    const durationMonths = Number(body.durationMonths) || 1
    const orderId = body.orderId as string | undefined
    const description = (body.description as string) || `Daisy plan ${planId}`
    const returnUrl = body.returnUrl as string | undefined
    const recurrent = Boolean(body.recurrent)

    const service = new FreedomPayStubService()
    const result = await service.createPayment({
      amount,
      currency,
      orderId,
      description,
      returnUrl,
      recurrent,
    })

    return NextResponse.json({
      ...result,
      planId,
      durationMonths,
      amount,
      currency,
    })
  } catch (error) {
    console.error('Freedom Pay create (stub) error:', error)
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    )
  }
}
