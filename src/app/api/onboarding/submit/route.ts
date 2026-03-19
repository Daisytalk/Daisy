import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'
import type { OnboardingAnswer } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'
import { computePsychProfile } from '@/shared/lib/scoring'
import { syncUserPreferences } from '@/shared/lib/memory'

const OnboardingSchema = z.object({
  answers: z.record(
    z.string().max(50),
    z.union([
      z.number().int().min(1).max(5),
      z.boolean(),
      z.string().max(500),
      z.array(z.string().max(100)).max(10),
      z.record(z.string(), z.unknown()), // relationship, yes-no-text: { value, rel_quality?, text?, other? }
    ])
  ).refine(obj => Object.keys(obj).length <= 30, 'Слишком много ответов'),
})

export async function POST(request: NextRequest) {
  try {
    // Cookie first (Google OAuth), then Bearer (email/password)
    let token = request.cookies.get('auth_token')?.value
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    if (!token) {
      return NextResponse.json(
        { message: apiMessages.authorizationRequired },
        { status: 401 }
      )
    }

    const decoded = AuthService.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { message: apiMessages.invalidToken },
        { status: 401 }
      )
    }

    const rawBody = await request.json()
    // Support both {answers: {}} map format (new) and {answers: []} array format (legacy)
    const bodyToValidate = Array.isArray(rawBody?.answers)
      ? { answers: Object.fromEntries((rawBody.answers as OnboardingAnswer[]).map((a, i) => [String(a.questionId ?? i), a.answer])) }
      : rawBody

    const parsed = OnboardingSchema.safeParse(bodyToValidate)
    if (!parsed.success) {
      const zodError = parsed.error.flatten()
      console.error('Onboarding validation failed:', zodError)
      return NextResponse.json(
        { message: apiMessages.answersArrayRequired, detail: zodError.fieldErrors },
        { status: 400 }
      )
    }

    const answers = rawBody?.answers as OnboardingAnswer[]

    await prisma.$transaction(async (tx) => {
      await tx.onboardingData.upsert({
        where: { userId: decoded.userId },
        create: {
          userId: decoded.userId,
          responses: answers as object,
          completed: true,
        },
        update: {
          responses: answers as object,
          completed: true,
        },
      })

      const profile = computePsychProfile(answers)
      await tx.psychProfileSnapshot.create({
        data: {
          userId: decoded.userId,
          ESI: profile.ESI,
          BSI: profile.BSI,
          SSI: profile.SSI,
          PVI: profile.PVI,
          MRI: profile.MRI,
          riskLevel: profile.riskLevel,
          cluster: profile.cluster ?? null,
          flags: profile.flags ?? undefined,
        },
      })
    })

    // Sync user preferences (goals, styles) for memory architecture
    const answersMap = Object.fromEntries(answers.map((a) => [a.questionId, a.answer]))
    const styles = Array.isArray(answersMap.communication_style) ? (answersMap.communication_style as string[]) : []
    const goals = Array.isArray(answersMap.support_needs) ? (answersMap.support_needs as string[]).slice(0, 2) : []
    await syncUserPreferences(decoded.userId, { communicationStyle: styles, goals })

    return NextResponse.json({ message: apiMessages.onboardingCompletedSuccess })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('Submit onboarding error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause,
    })
    const body: { message: string; detail?: string } = { message: apiMessages.internalServerError }
    if (process.env.NODE_ENV === 'development') body.detail = err.message
    return NextResponse.json(body, { status: 500 })
  }
}