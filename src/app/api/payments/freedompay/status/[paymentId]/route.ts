import { NextRequest, NextResponse } from 'next/server'
import { FreedomPayStubService } from '@/shared/services/freedompay'
import { apiMessages } from '@/shared/api-messages'
import { paymentsDisabledResponse, paymentsEnabled } from '@/shared/lib/payments-enabled'

/** TODO(security): enable when Freedom Pay server callback + signature verification ships. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  if (!paymentsEnabled()) {
    return paymentsDisabledResponse()
  }
  try {
    const { paymentId } = await params
    if (!paymentId) {
      return NextResponse.json({ error: apiMessages.paymentIdRequired }, { status: 400 })
    }

    const service = new FreedomPayStubService()
    const result = await service.getPaymentStatus(paymentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Freedom Pay status (stub) error:', error)
    return NextResponse.json(
      { error: apiMessages.statusCheckFailed },
      { status: 500 }
    )
  }
}
