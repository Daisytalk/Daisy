import { NextRequest, NextResponse } from 'next/server'
import { sendChatMessage, checkAIApiHealth, getAIApiConfig } from '@/shared/lib/ai-api'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const config = getAIApiConfig()
    const isHealthy = await checkAIApiHealth()
    return NextResponse.json({
      config: { url: config.url, hasApiKey: config.hasApiKey },
      health: { isHealthy, timestamp: new Date().toISOString() },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const body = await request.json()
    const { text = 'Hello, this is a test message' } = body
    const response = await sendChatMessage(text, 'test-user-id', 'test-session-id')
    return NextResponse.json({ success: true, response, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
