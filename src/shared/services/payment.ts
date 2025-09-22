import Stripe from 'stripe'
import { env } from '@/shared/config/env'

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
}

export interface IPaymentService {
  createPaymentIntent(amount: number, currency?: string): Promise<PaymentIntent>
  retrievePaymentIntent(id: string): Promise<PaymentIntent>
}

export class StripePaymentService implements IPaymentService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd'
  ): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    }
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(id)

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    }
  }
}