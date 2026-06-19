import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const url = process.env.AI_API_URL
  return NextResponse.json({
    hasAiApiUrl: !!url,
    aiApiUrlPrefix: url ? url.substring(0, 50) + '...' : null,
    hasAiApiKey: !!process.env.AI_API_KEY,
    hasCbtApiUrl: !!process.env.CBT_API_URL,
    hasCbtApiKey: !!process.env.CBT_API_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  })
}
