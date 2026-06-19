import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth'

/** GET /api/account/psych-profile — последний психопрофиль для отображения в кабинете */
export async function GET(request: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(request)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const snapshot = await prisma.psychProfileSnapshot.findFirst({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!snapshot) return NextResponse.json({ profile: null })

    const labels: Record<string, string> = {
      ESI: 'Эмоциональная устойчивость',
      BSI: 'Уровень стресса',
      SSI: 'Социальная поддержка',
      PVI: 'Физическая уязвимость',
      MRI: 'Ресурс и смыслы',
    }

    const status = (val: number, inverse: boolean) => {
      const v = inverse ? 100 - val : val
      if (v >= 70) return 'Хорошо'
      if (v >= 50) return 'Нормально'
      if (v >= 30) return inverse ? 'Повышен' : 'Нестабильно'
      return inverse ? 'Высокий' : 'Истощение'
    }

    return NextResponse.json({
      profile: {
        ESI: snapshot.ESI,
        BSI: snapshot.BSI,
        SSI: snapshot.SSI,
        PVI: snapshot.PVI,
        MRI: snapshot.MRI,
        riskLevel: snapshot.riskLevel,
        cluster: snapshot.cluster,
        labels,
        statusESI: status(snapshot.ESI, false),
        statusBSI: status(snapshot.BSI, true),
        statusSSI: status(snapshot.SSI, false),
        statusMRI: status(snapshot.MRI, false),
        createdAt: snapshot.createdAt,
      },
    })
  } catch (error) {
    console.error('Psych profile error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
