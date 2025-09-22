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
    return await prisma.user.create({
      data,
    })
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }
}