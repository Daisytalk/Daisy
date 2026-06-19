import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import { prepareSensitiveJsonForStorage } from '@/shared/lib/sensitive-field-crypto'

/**
 * DELETE /api/account/memory
 * Очистка conversationMemory (накопленных фактов о пользователе)
 */
export async function DELETE(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 })

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { conversationMemory: prepareSensitiveJsonForStorage([]) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', ctx: 'clear_memory', message: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}
