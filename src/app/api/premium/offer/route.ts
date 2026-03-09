import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import { checkPremiumTrigger } from '@/shared/lib/premium-triggers'
import { getTopicCounts7d } from '@/shared/lib/memory'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const [psychSnapshot, convCount, lastConv, onboarding] = await Promise.all([
      prisma.psychProfileSnapshot.findFirst({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cbtConversation.count({ where: { userId: decoded.userId } }),
      prisma.cbtConversation.findFirst({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.onboardingData.findUnique({
        where: { userId: decoded.userId },
        select: { responses: true },
      }),
    ])

    let relQuality = 5
    if (onboarding?.responses && typeof onboarding.responses === 'object') {
      const res = onboarding.responses as Record<string, unknown> | { questionId: string; answer: unknown }[]
      const rel = Array.isArray(res)
        ? (res as { questionId: string; answer: unknown }[]).find((r) => r.questionId === 'relationships')?.answer
        : (res as Record<string, unknown>).relationships
      if (rel && typeof rel === 'object' && !Array.isArray(rel)) {
        const r = rel as Record<string, unknown>
        if (r.value === 'yes' && typeof r.rel_quality === 'number') relQuality = r.rel_quality
      }
    }

    const topicCounts = await getTopicCounts7d(decoded.userId)

    const offer = await checkPremiumTrigger(
      decoded.userId,
      {
        ESI: psychSnapshot?.ESI,
        BSI: psychSnapshot?.BSI,
        SSI: psychSnapshot?.SSI,
        MRI: psychSnapshot?.MRI,
        riskLevel: psychSnapshot?.riskLevel ?? undefined,
        flags: psychSnapshot?.flags as Record<string, boolean> | undefined,
      },
      {
        relQuality,
        relationshipTopicCount7d: topicCounts.relationshipTopicCount7d,
        sleepTopicCount7d: topicCounts.sleepTopicCount7d,
        sessionCount: convCount,
        lastActiveAt: lastConv?.updatedAt,
      }
    )

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Premium offer check error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
