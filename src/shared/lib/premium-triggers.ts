/**
 * Premium triggers P1-P5. Rules: не чаще 1 раза в 7 дней, после успешной регуляции.
 */

import prisma from '@/shared/lib/database'

export type PremiumTriggerType = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'

export interface PremiumOffer {
  triggerType: PremiumTriggerType
  title: string
  description: string
  cta: string
}

const OFFERS: Record<PremiumTriggerType, Omit<PremiumOffer, 'triggerType'>> = {
  P1: {
    title: 'Расширенный план стабилизации',
    description: '7 дней ежедневных чек-инов и поддержки',
    cta: 'Узнать больше',
  },
  P2: {
    title: 'Пакет «Отношения»',
    description: 'Сценарии разговоров, разбор конфликтов, трекер триггеров',
    cta: 'Подробнее',
  },
  P3: {
    title: 'Сон и энергия',
    description: 'Протокол 14 дней: вечерние и утренние ритуалы',
    cta: 'Начать',
  },
  P4: {
    title: 'План поддержки',
    description: 'Микрошаги социализации и безопасные диалоги',
    cta: 'Узнать',
  },
  P5: {
    title: 'Лёгкий режим',
    description: '3 минуты в день + авто-навигация «что делать сейчас»',
    cta: 'Попробовать',
  },
}

const COOLDOWN_DAYS = 7

export async function checkPremiumTrigger(
  userId: string,
  psychProfile: { ESI?: number; BSI?: number; SSI?: number; MRI?: number; riskLevel?: string; flags?: Record<string, boolean> },
  context?: { relQuality?: number; relationshipTopicCount7d?: number; sleepTopicCount7d?: number; sessionCount?: number; lastActiveAt?: Date; MRI?: number }
): Promise<PremiumOffer | null> {
  const lastOffer = await prisma.premiumOfferLog.findFirst({
    where: { userId },
    orderBy: { offerShownAt: 'desc' },
  })
  if (lastOffer) {
    const daysSince = (Date.now() - lastOffer.offerShownAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < COOLDOWN_DAYS) return null
  }

  const esi = psychProfile.ESI ?? 50
  const bsi = psychProfile.BSI ?? 50
  const ssi = psychProfile.SSI ?? 50
  const riskLevel = psychProfile.riskLevel ?? 'low'

  // P1: High-risk onboarding
  if (['high', 'critical'].includes(riskLevel) || (bsi >= 70 && (context?.MRI ?? psychProfile.MRI ?? 50) <= 40)) {
    return await logAndReturn(userId, 'P1')
  }

  // P2: Relationship pain (rel_quality <= 2 or relationship topic 3+ раз за 7 дней)
  const relQuality = context?.relQuality ?? 5
  if (relQuality <= 2) return await logAndReturn(userId, 'P2')
  if ((context?.relationshipTopicCount7d ?? 0) >= 3) {
    return await logAndReturn(userId, 'P2')
  }

  // P3: Sleep/physical loop
  if (psychProfile.flags?.sleep_issues && (context?.sleepTopicCount7d ?? 0) >= 2) {
    return await logAndReturn(userId, 'P3')
  }

  // P4: Low SSI (loneliness)
  if (ssi <= 35) {
    return await logAndReturn(userId, 'P4')
  }

  // P5: Churn prevention
  const sessionCount = context?.sessionCount ?? 0
  if (sessionCount >= 2 && sessionCount <= 5 && bsi >= 60) {
    const lastActive = context?.lastActiveAt
    if (lastActive) {
      const daysInactive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      if (daysInactive >= 2) return await logAndReturn(userId, 'P5')
    }
  }

  return null
}

async function logAndReturn(userId: string, triggerType: PremiumTriggerType): Promise<PremiumOffer> {
  await prisma.premiumOfferLog.create({
    data: { userId, triggerType },
  })
  return { triggerType, ...OFFERS[triggerType] }
}
