import { NextResponse } from 'next/server'

/**
 * Debug endpoint: which env vars the app sees at runtime (no secrets).
 * Use to verify Azure App Service env is applied.
 */
export async function GET() {
  const url = process.env.AI_API_URL || process.env.NEXT_PUBLIC_AI_API_URL
  return NextResponse.json({
    hasAiApiUrl: !!url,
    aiApiUrlPrefix: url ? url.substring(0, 50) + '...' : null,
    hasAiApiKey: !!(process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY),
    hasCbtApiUrl: !!process.env.CBT_API_URL,
    hasCbtApiKey: !!process.env.CBT_API_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    envSource: process.env.AI_API_URL ? 'AI_API_URL' : process.env.NEXT_PUBLIC_AI_API_URL ? 'NEXT_PUBLIC_AI_API_URL' : 'none',
  })
}
