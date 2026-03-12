import { Prisma } from '@prisma/client'
import prisma from '@/shared/lib/database'
import type { OnboardingData, CreateOnboardingData, UpdateOnboardingData } from './model'

export interface IOnboardingRepository {
  create(data: CreateOnboardingData): Promise<OnboardingData>
  findByUserId(userId: string): Promise<OnboardingData | null>
  update(userId: string, data: UpdateOnboardingData): Promise<OnboardingData>
  delete(userId: string): Promise<void>
}

export class OnboardingRepository implements IOnboardingRepository {
  async create(data: CreateOnboardingData): Promise<OnboardingData> {
    const result = await prisma.onboardingData.create({
      data: {
        ...data,
        responses: data.responses as Prisma.InputJsonValue,
      },
    })
    return {
      ...result,
      responses: result.responses as Record<string, unknown> | null,
    }
  }

  async findByUserId(userId: string): Promise<OnboardingData | null> {
    const result = await prisma.onboardingData.findUnique({
      where: { userId },
    })
    if (!result) return null
    return {
      ...result,
      responses: result.responses as Record<string, unknown> | null,
    }
  }

  async update(userId: string, data: UpdateOnboardingData): Promise<OnboardingData> {
    const result = await prisma.onboardingData.update({
      where: { userId },
      data: {
        ...data,
        responses: data.responses as Prisma.InputJsonValue,
      },
    })
    return {
      ...result,
      responses: result.responses as Record<string, unknown> | null,
    }
  }

  async delete(userId: string): Promise<void> {
    await prisma.onboardingData.delete({
      where: { userId },
    })
  }
}