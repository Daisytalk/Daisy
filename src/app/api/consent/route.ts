import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { apiMessages } from '@/shared/api-messages'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'
import {
  CURRENT_CONSENT_VERSION,
  REQUIRED_CONSENT_TYPES,
  type ConsentType,
} from '@/shared/config/consent'

const VALID_CONSENT_TYPES = new Set<string>(REQUIRED_CONSENT_TYPES)

export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })
    }

    const logs = await prisma.consentLog.findMany({
      where: {
        userId: decoded.userId,
        consentVersion: CURRENT_CONSENT_VERSION,
        consentType: { in: [...REQUIRED_CONSENT_TYPES] },
      },
      select: { consentType: true },
    })

    const granted = [...new Set(logs.map((l) => l.consentType))]
    const missing = REQUIRED_CONSENT_TYPES.filter((t) => !granted.includes(t))

    return NextResponse.json({
      consentVersion: CURRENT_CONSENT_VERSION,
      required: REQUIRED_CONSENT_TYPES,
      granted,
      missing,
      hasRequiredConsents: missing.length === 0,
    })
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', ctx: 'consent_get', message: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 })
    }

    const body = await request.json()
    const rawTypes: unknown[] = Array.isArray(body.consentTypes)
      ? body.consentTypes
      : body.consentType
        ? [body.consentType]
        : []

    const consentTypes = rawTypes.filter(
      (t): t is ConsentType => typeof t === 'string' && VALID_CONSENT_TYPES.has(t)
    )

    if (consentTypes.length === 0) {
      return NextResponse.json({ error: 'Valid consentTypes required' }, { status: 400 })
    }

    const consentVersion =
      typeof body.consentVersion === 'string' ? body.consentVersion : CURRENT_CONSENT_VERSION
    const locale = typeof body.locale === 'string' ? body.locale : null

    await prisma.consentLog.createMany({
      data: consentTypes.map((consentType) => ({
        userId: decoded.userId,
        consentVersion,
        consentType,
        locale,
      })),
    })

    const allGranted = REQUIRED_CONSENT_TYPES.every((t) => consentTypes.includes(t))
    if (!allGranted) {
      const existing = await prisma.consentLog.findMany({
        where: {
          userId: decoded.userId,
          consentVersion: CURRENT_CONSENT_VERSION,
          consentType: { in: [...REQUIRED_CONSENT_TYPES] },
        },
        select: { consentType: true },
      })
      const granted = [...new Set([...existing.map((l) => l.consentType), ...consentTypes])]
      const missing = REQUIRED_CONSENT_TYPES.filter((t) => !granted.includes(t))
      return NextResponse.json({
        success: true,
        granted,
        missing,
        hasRequiredConsents: missing.length === 0,
      })
    }

    return NextResponse.json({
      success: true,
      granted: [...REQUIRED_CONSENT_TYPES],
      missing: [],
      hasRequiredConsents: true,
    })
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', ctx: 'consent_post', message: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: apiMessages.internalServerError }, { status: 500 })
  }
}
