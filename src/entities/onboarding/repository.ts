import { prisma } from '@/shared/lib/database'
import type { OnboardingData, CreateOnboardingData, UpdateOnboardingData } from './model'

export interface IOnboardingRepository {
  create(data: CreateOnboardingData): Promise<OnboardingData>
  findByUserId(userId: string): Promise<OnboardingData | null>
  update(userId: string, data: UpdateOnboardingData): Promise<OnboardingData>
  delete(userId: string): Promise<void>
}

export class OnboardingRepository implements IOnboardingRepository {
  async create(data: CreateOnboardingData): Promise<OnboardingData> {
    return await prisma.onboardingData.create({
      data,
    })
  }

  async findByUserId(userId: string): Promise<OnboardingData | null> {
    return await prisma.onboardingData.findUnique({
      where: { userId },
    })
  }

  async update(userId: string, data: UpdateOnboardingData): Promise<OnboardingData> {
    return await prisma.onboardingData.update({
      where: { userId },
      data,
    })
  }

  async delete(userId: string): Promise<void> {
    await prisma.onboardingData.delete({
      where: { userId },
    })
  }
}