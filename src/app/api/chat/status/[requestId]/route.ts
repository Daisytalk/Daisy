import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { getDecryptedContent } from '@/shared/lib/cbt-message-content'
import type { DaisyState } from '@/shared/types/daisy'

interface CompletedStatusPayload {
    status: 'completed'
    response: string
    daisy_state: DaisyState | null
    is_error?: boolean
}

const SSE_POLL_MS = 2000
const SSE_MAX_ATTEMPTS = 90 // ~3 min at 2s

function wantsSse(request: NextRequest): boolean {
    const accept = request.headers.get('accept') || ''
    return accept.includes('text/event-stream') || request.nextUrl.searchParams.get('stream') === '1'
}

async function findCompletedPayload(requestId: string, userId: string): Promise<CompletedStatusPayload | null> {
    const message = await prisma.cbtMessage.findFirst({
        where: {
            id: requestId,
            conversation: { userId },
        },
    })
    if (!message) return null

    const assistantMessage = await prisma.cbtMessage.findFirst({
        where: {
            conversationId: message.conversationId,
            role: 'assistant',
            createdAt: { gt: message.createdAt },
        },
        orderBy: { createdAt: 'asc' },
    })
    if (!assistantMessage) return null

    const isError = assistantMessage.protocol === 'error'
    return {
        status: 'completed',
        response: getDecryptedContent(assistantMessage.content),
        daisy_state: (assistantMessage.daisyState as DaisyState | null) ?? null,
        ...(isError ? { is_error: true } : {}),
    }
}

function sseResponse(
    requestId: string,
    userId: string,
): Response {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            const send = (payload: object) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
            }
            try {
                for (let attempt = 0; attempt < SSE_MAX_ATTEMPTS; attempt++) {
                    const completed = await findCompletedPayload(requestId, userId)
                    if (completed) {
                        send(completed)
                        controller.close()
                        return
                    }
                    send({ status: 'processing', message: apiMessages.companionPreparingResponse })
                    await new Promise((r) => setTimeout(r, SSE_POLL_MS))
                }
                send({ status: 'failed', errorMessage: 'The response is taking longer than expected. Please try again.' })
                controller.close()
            } catch (err) {
                console.error('SSE status error:', err)
                send({ status: 'failed', errorMessage: apiMessages.internalServerError })
                controller.close()
            }
        },
    })
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    })
}

/**
 * Poll endpoint to check status of async chat request.
 * GET /api/chat/status/[requestId]
 * Accept: text/event-stream (or ?stream=1) for a single SSE connection instead of repeated polls.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ requestId: string }> }) {
    const params = await props.params
    try {
        const requestId = params.requestId

        const decoded = await getVerifiedAuthFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })
        }

        const message = await prisma.cbtMessage.findFirst({
            where: {
                id: requestId,
                conversation: { userId: decoded.userId },
            },
        })

        if (!message) {
            return NextResponse.json({ error: apiMessages.requestNotFound }, { status: 404 })
        }

        if (wantsSse(request)) {
            return sseResponse(requestId, decoded.userId)
        }

        const completed = await findCompletedPayload(requestId, decoded.userId)
        if (completed) {
            return NextResponse.json(completed)
        }

        return NextResponse.json({
            status: 'processing',
            message: apiMessages.companionPreparingResponse,
        })
    } catch (error: unknown) {
        console.error('Status check error:', error)
        return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
    }
}
