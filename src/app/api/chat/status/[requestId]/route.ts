import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getDecryptedContent } from '@/shared/lib/cbt-message-content'

/**
 * Poll endpoint to check status of async chat request
 * GET /api/chat/status/[requestId]
 */
export async function GET(request: NextRequest, props: { params: Promise<{ requestId: string }> }) {
    const params = await props.params;
    try {
        const requestId = params.requestId

        // Authentication
        let token = request.cookies.get('auth_token')?.value
        if (!token) {
            const authHeader = request.headers.get('authorization')
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7)
            }
        }

        if (!token) {
            return NextResponse.json({ error: apiMessages.unauthorized }, { status: 401 })
        }

        const decoded = AuthService.verifyToken(token)
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
            // Response is ready
            return NextResponse.json({
                status: 'completed',
                response: getDecryptedContent(assistantMessage.content),
                protocol: assistantMessage.protocol,
                persona: assistantMessage.persona,
                diagnosis: assistantMessage.diagnosis
            })
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
