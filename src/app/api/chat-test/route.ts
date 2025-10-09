import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Test endpoint to see what format @ai-sdk/react sends
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      received: body,
      keys: Object.keys(body),
      messagesLength: body.messages?.length || 0,
      firstMessage: body.messages?.[0] || null,
      lastMessage: body.messages?.[body.messages?.length - 1] || null,
      directText: body.text || null,
      directContent: body.content || null,
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
