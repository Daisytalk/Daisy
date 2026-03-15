import prisma from '@/shared/lib/database'
import { subDays } from 'date-fns'

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
    description: 'Оффер: Расширенный план стабилизации на 7 дней + ежедневные чек-ины',
    cta: 'Узнать больше',
  },
  P2: {
    title: 'Пакет «Отношения»',
    description: 'Оффер: Пакет «Отношения»: сценарии разговоров + разбор конфликтов + трекер триггеров',
    cta: 'Подробнее',
  },
  P3: {
    title: 'Сон и энергия',
    description: 'Оффер: Сон и энергия: протокол 14 дней + вечерние/утренние ритуалы',
    cta: 'Начать',
  },
  P4: {
    title: 'План поддержки',
    description: 'Оффер: План поддержки: микрошаги социализации + безопасные диалоги',
    cta: 'Узнать',
  },
  P5: {
    title: 'Лёгкий режим',
    description: 'Оффер: Лёгкий режим: 3 минуты в день + авто-навигация «что делать сейчас»',
    cta: 'Попробовать',
  },
}

const COOLDOWN_DAYS = 7

/**
 * Checks all active premium triggers based on the user's latest psychological profile and behavior patterns.
 * Modeless design based on the database runtime context. 
 */
export async function checkPremiumTrigger(userId: string): Promise<PremiumOffer | null> {
  const now = new Date()

  // 1. Cooldown Policy (не чаще 1 раза в 7 дней)
  const lastOffer = await prisma.premiumOfferLog.findFirst({
    where: { userId },
    orderBy: { offerShownAt: 'desc' },
  })
  
  if (lastOffer) {
    const daysSince = (now.getTime() - lastOffer.offerShownAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < COOLDOWN_DAYS) return null
  }

  // 2. Fetch Context Data
  const snapshot = await prisma.psychProfileSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  if (!snapshot) return null

  const state = await prisma.conversationState.findUnique({
    where: { userId },
  })

  const memoryItems = await prisma.memoryItem.findMany({
    where: { 
      userId,
      createdAt: { gte: subDays(now, 7) }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const cbtSessions = await prisma.cbtConversation.count({
    where: { userId }
  })

  const { ESI = 50, BSI = 50, SSI = 50, PVI = 50, MRI = 50, riskLevel = 'low' } = snapshot
  
  // P1: High-risk onboarding
  if (['high', 'critical'].includes(riskLevel) || (BSI >= 70 && MRI <= 40)) {
    return await logAndReturn(userId, 'P1')
  }

  // P2: Relationship pain (rel_quality <= 2 or relationship topic 3+ раз за 7 дней)
  let relationshipMentions = 0
  for (const item of memoryItems) {
    if (item.topic === 'relationship') {
      relationshipMentions++
    }
  }
  // Try getting rel_quality out of onboarding mapping if present (Optional safety wrapper)
  let relQuality = 5; 
  const onboarding = await prisma.onboardingData.findUnique({ where: { userId } })
  if (onboarding?.responses && typeof onboarding.responses === 'object') {
     const r = (onboarding.responses as Record<string,any>)['relationships']
     if (r && r.value === 'yes' && typeof r.rel_quality === 'number') {
       relQuality = r.rel_quality
     }
  }

  if (relQuality <= 2 || relationshipMentions >= 3) {
    return await logAndReturn(userId, 'P2')
  }

  // P3: Sleep/physical loop
  let sleepMentions = memoryItems.filter(item => item.topic === 'sleep' || item.topic === 'health').length
  if (PVI <= 40 || sleepMentions >= 2) {
    return await logAndReturn(userId, 'P3')
  }

  // P4: Low SSI (loneliness)
  if (SSI <= 35) {
    return await logAndReturn(userId, 'P4')
  }

  // P5: Churn prevention
  if (cbtSessions >= 2 && cbtSessions <= 5 && BSI >= 60) {
    if (state?.lastSessionAt) {
      const daysInactive = (now.getTime() - state.lastSessionAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysInactive >= 2 && daysInactive <= 3) {
        return await logAndReturn(userId, 'P5')
      }
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

