import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Only allow in development or with a secret key
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    // Never log actual secrets, just check if they exist
  })
}
