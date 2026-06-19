/**
 * Payment integration is disabled in production until Freedom Pay server callback
 * + signature verification ships.
 * TODO(security): enable when real Merchant API integration is complete.
 */
export function paymentsEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return process.env.ENABLE_PAYMENT_STUB === 'true'
}

export function paymentsDisabledResponse() {
  return Response.json(
    { message: 'Payments are not available yet.' },
    { status: 503 }
  )
}
