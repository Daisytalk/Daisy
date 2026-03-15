import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    if (!token) {
      token = request.cookies.get('auth_token')?.value
    }
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const decoded = AuthService.verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Fetch the onboarding data to compute the profile summary
    const onboarding = await prisma.onboardingData.findUnique({
      where: { userId: decoded.userId }
    })

    if (!onboarding || !onboarding.responses) {
      return NextResponse.json({ error: 'No onboarding data found' }, { status: 404 })
    }

    const responses = onboarding.responses as Record<string, any>

    const num = (q: string): number => {
      const a = responses[q]
      return typeof a === 'number' ? a : 3 // default middle if not found
    }

    const mood_today = num('mood_today')
    const emo_state = num('emo_state')
    const work_state = num('work_state')
    const physical_state = num('physical_state')
    
    // Support scale logic
    const relRaw = responses['relationships']
    let rel_quality: number | null = null
    if (relRaw && typeof relRaw === 'object' && !Array.isArray(relRaw) && relRaw.value === 'yes') {
      rel_quality = relRaw.rel_quality as number
    }
    const family_support = num('family_support')
    const social_support = num('social_support')

    const solo_comfort = num('solo_comfort')

    // 1. Emotional Stability: mood_today + emo_state
    const emotionalStability = (mood_today + emo_state) / 2

    // 2. Stress Level: work_state + physical_state
    // PDF: Уровень стресса -> Q4 + Q8. For stress, higher original rating is higher stress? No, 1-5 scales in questions are usually 5=good, 1=bad.
    // Wait, the PDF says: "Для 'негативных' шкал нормирование уже ок. Для стресса инверс."
    // Let's assume the work_state and physical_state are 1=bad, 5=good. So stress as a scale from 1-5 where 5 is HIGH stress would be inverted, or we just leave it as is if the UI handles it as 5 = good.
    // The statuses for Stress Level are: 1.0-1.8 "Очень высокий", 4.3-5.0 "Спокойно".
    // Ah! So 1.0 = VERY HIGH STRESS, 5.0 = CALM (low stress).
    // So the scale is actually "Calmness". Higher is better!
    // So if it's average of work_state + physical_state, higher is better, so 1.0-1.8 is bad. This matches exactly.
    const stressLevel = (work_state + physical_state) / 2

    // 3. Support
    let supportSum = family_support + social_support
    let supportCount = 2
    if (rel_quality !== null) {
      supportSum += rel_quality
      supportCount = 3
    }
    const support = supportSum / supportCount

    // 4. Resource: solo_comfort + physical_state + mood_today
    const resource = (solo_comfort + physical_state + mood_today) / 3

    return NextResponse.json({
      emotionalStability: Number(emotionalStability.toFixed(1)),
      stressLevel: Number(stressLevel.toFixed(1)),
      support: Number(support.toFixed(1)),
      resource: Number(resource.toFixed(1))
    })

  } catch (error) {
    console.error('Profile metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
