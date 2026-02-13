/**
 * Freedom Pay (Freedom Bank) — заглушка интеграции.
 * Документация: https://docs.freedompay.kz
 * Merchant API: Purchase (Create payment, Recurrent, Status), Checkout.
 * Реальные вызовы API не выполняются, возвращаются мок-данные.
 */

/** Результат создания платежа (Merchant API / Create payment) */
export interface FreedomPayCreatePaymentResult {
  paymentId: string
  status: 'pending' | 'created' | 'redirect'
  redirectUrl?: string
  /** Для 3DSecure / проверки карты */
  orderId?: string
}

/** Статус платежа (Merchant API / Status, Gateway Sync API / Status) */
export type FreedomPayPaymentStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'refunded'
  | 'reversed'
  | 'error'

export interface FreedomPayPaymentStatusResult {
  paymentId: string
  status: FreedomPayPaymentStatus
  amount?: number
  currency?: string
  orderId?: string
}

/** Параметры создания платежа (заглушка) */
export interface FreedomPayCreatePaymentParams {
  amount: number
  currency?: string
  orderId?: string
  description?: string
  /** Рекуррентный платёж (подписка) */
  recurrent?: boolean
  returnUrl?: string
  notifyUrl?: string
}

const STUB_PREFIX = 'fp_stub_'

/**
 * Заглушка клиента Freedom Pay. Не выполняет реальных запросов к api.freedompay.kz.
 * После подключения API подставить реальные вызовы по https://docs.freedompay.kz (Merchant API / Purchase).
 */
export class FreedomPayStubService {
  /** Create payment — заглушка, возвращает мок paymentId и status */
  async createPayment(params: FreedomPayCreatePaymentParams): Promise<FreedomPayCreatePaymentResult> {
    const id = `${STUB_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    return {
      paymentId: id,
      status: 'created',
      orderId: params.orderId ?? id,
      redirectUrl: params.returnUrl ? `${params.returnUrl}?payment_id=${id}` : undefined,
    }
  }

  /** Payment status — заглушка */
  async getPaymentStatus(paymentId: string): Promise<FreedomPayPaymentStatusResult> {
    const isStub = paymentId.startsWith(STUB_PREFIX)
    return {
      paymentId,
      status: isStub ? 'approved' : 'pending',
      amount: undefined,
      currency: 'KZT',
      orderId: paymentId,
    }
  }

  /** Healthcheck — заглушка (реальный эндпоинт: https://api.freedompay.kz/status/healthcheck) */
  async healthCheck(): Promise<{ status: string; time: string }> {
    return {
      status: 'ok',
      time: new Date().toISOString(),
    }
  }
}
