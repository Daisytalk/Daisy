import { NextRequest, NextResponse } from 'next/server'
import { FreedomPayStubService } from '@/shared/services/freedompay'

/**
 * Заглушка: статус платежа Freedom Pay.
 * Документация: https://docs.freedompay.kz (Merchant API / Purchase / Status)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId required' }, { status: 400 })
    }

    const service = new FreedomPayStubService()
    const result = await service.getPaymentStatus(paymentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Freedom Pay status (stub) error:', error)
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    )
  }
}
