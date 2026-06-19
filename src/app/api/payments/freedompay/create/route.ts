import { NextRequest, NextResponse } from 'next/server'
import { FreedomPayStubService } from '@/shared/services/freedompay'
import { apiMessages } from '@/shared/api-messages'
import { paymentsDisabledResponse, paymentsEnabled } from '@/shared/lib/payments-enabled'

/**
 * Заглушка: создание платежа Freedom Pay.
 * TODO(security): enable when Freedom Pay server callback + signature verification ships.
 */
export async function POST(request: NextRequest) {
  if (!paymentsEnabled()) {
    return paymentsDisabledResponse()
  }
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
      { error: apiMessages.paymentCreationFailed },
      { status: 500 }
    )
  }
}
