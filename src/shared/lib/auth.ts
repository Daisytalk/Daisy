import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@/shared/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  static verifyToken(token: string): { userId: string; email: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    } catch {
      return null
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateTrialEndDate(): Date {
    const now = new Date()
    now.setDate(now.getDate() + 3) // 3 days trial
    return now
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
}