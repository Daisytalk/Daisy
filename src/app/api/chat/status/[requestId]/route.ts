import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { getDecryptedContent } from '@/shared/lib/cbt-message-content'
import type { DaisyState } from '@/shared/types/daisy'

interface CompletedStatusPayload {
    status: 'completed'
    response: string
    protocol: string | null
    persona: string | null
    diagnosis: string[]
    daisy_state: DaisyState | null
}

/**
 * Poll endpoint to check status of async chat request
 * GET /api/chat/status/[requestId]
 */
export async function GET(request: NextRequest, props: { params: Promise<{ requestId: string }> }) {
    const params = await props.params;
    try {
        const requestId = params.requestId

        const decoded = await getVerifiedAuthFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })
        }

        // Find the pending message by request ID
        const message = await prisma.cbtMessage.findFirst({
            where: {
                id: requestId,
                conversation: {
                    userId: decoded.userId
                }
            },
            include: {
                conversation: true
            }
        })

        if (!message) {
            return NextResponse.json({ error: apiMessages.requestNotFound }, { status: 404 })
        }

        // Check if we have a response yet
        const assistantMessage = await prisma.cbtMessage.findFirst({
            where: {
                conversationId: message.conversationId,
                role: 'assistant',
                createdAt: {
                    gt: message.createdAt
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        if (assistantMessage) {
            const payload: CompletedStatusPayload = {
                status: 'completed',
                response: getDecryptedContent(assistantMessage.content),
                protocol: assistantMessage.protocol,
                persona: assistantMessage.persona,
                diagnosis: assistantMessage.diagnosis,
                daisy_state: (assistantMessage.daisyState as DaisyState | null) ?? null,
            }
            return NextResponse.json(payload)
        }

        // Still processing
        return NextResponse.json({
            status: 'processing',
            message: apiMessages.companionPreparingResponse
        })

    } catch (error: unknown) {
        console.error('Status check error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : apiMessages.internalServerError },
            { status: 500 }
        )
    }
}
