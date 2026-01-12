export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
  AI_API_URL: process.env.NEXT_PUBLIC_AI_API_URL || '',
  AI_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

if (typeof window === 'undefined') {
  const missingVars: string[] = []

  if (!env.DATABASE_URL) missingVars.push('DATABASE_URL')
  if (!env.AI_API_URL) missingVars.push('NEXT_PUBLIC_AI_API_URL')
  if (!env.AI_API_KEY) missingVars.push('NEXT_PUBLIC_AI_API_KEY')

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '))
  }
}
