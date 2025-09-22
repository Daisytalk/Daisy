import { prisma } from '@/shared/lib/database'
import type { User, CreateUserData, UpdateUserData } from './model'

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}

export class UserRepository implements IUserRepository {
  async create(data: CreateUserData): Promise<User> {
    const result = await prisma.user.create({
      data,
    })
    return {
      ...result,
      name: result.name ?? undefined,
    }
  }

  async findById(id: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { id },
    })
    if (!result) return null
    return {
      ...result,
      name: result.name ?? undefined,
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { email },
    })
    if (!result) return null
    return {
      ...result,
      name: result.name ?? undefined,
    }
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const result = await prisma.user.update({
      where: { id },
      data,
    })
    return {
      ...result,
      name: result.name ?? undefined,
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }
}