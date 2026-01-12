import { NextRequest, NextResponse } from 'next/server'
import { sendChatMessage, checkAIApiHealth, getAIApiConfig } from '@/shared/lib/ai-api'

export async function GET(request: NextRequest) {
  try {
    const config = getAIApiConfig()
    const isHealthy = await checkAIApiHealth()

    return NextResponse.json({
      config: {
        url: config.url,
        hasApiKey: config.hasApiKey,
        apiKeyLength: config.apiKeyLength
      },
      health: {
        isHealthy,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text = 'Hello, this is a test message' } = body

    console.log('🧪 Testing AI API with message:', text)

    const response = await sendChatMessage(
      text,
      'test-user-id',
      'test-session-id'
    )

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('🧪 AI API Test Failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
