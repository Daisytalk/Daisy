import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@/shared/types/auth'
import prisma from '@/shared/lib/database'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d'

export type TokenPayload = {
  userId: string;
  email: string;
  name?: string;
  isOnboarded: boolean;
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired';
  trialEndsAt: Date | null;
}

export class AuthService {
  static generateToken(user: User): string {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set.')
    }
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      isOnboarded: user.isOnboarded,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt || null
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): TokenPayload | null {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set.')
    }
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload
    } catch {
      return null
    }
  }

  /** JWT + blacklist + deactivated check; refreshes subscription claims from DB. */
  static async validateSession(
    token: string,
    opts?: { allowDeactivated?: boolean }
  ): Promise<TokenPayload | null> {
    const decoded = this.verifyToken(token)
    if (!decoded) return null

    const [blacklisted, user] = await Promise.all([
      prisma.tokenBlacklist.findUnique({ where: { token }, select: { id: true } }),
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          deactivatedAt: true,
          subscriptionStatus: true,
          isOnboarded: true,
          email: true,
          name: true,
        },
      }),
    ])

    if (blacklisted || !user) return null
    if (!opts?.allowDeactivated && user.deactivatedAt) return null

    return {
      ...decoded,
      email: user.email,
      name: user.name ?? decoded.name,
      isOnboarded: user.isOnboarded,
      subscriptionStatus: user.subscriptionStatus as TokenPayload['subscriptionStatus'],
      trialEndsAt: decoded.trialEndsAt,
    }
  }

  static async blacklistToken(token: string, userId: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await prisma.tokenBlacklist.upsert({
      where: { token },
      create: { token, userId, expiresAt },
      update: { expiresAt },
    }).catch(() => {})
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

export const loginUser = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important: Include cookies
  })

  return response.json()
}

export const logoutUser = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include', // Important: Include cookies
  })
}

export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include', // Important: Include cookies
  })

  return response.json()
}
