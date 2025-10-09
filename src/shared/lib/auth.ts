import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@/shared/types/auth'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d'

type TokenPayload = {
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

// export const getAuthToken = (): string | null => {
//   if (typeof window === 'undefined') return null
//   return localStorage.getItem('auth_token')
// }

// export const setAuthToken = (token: string): void => {
//   if (typeof window === 'undefined') return
//   localStorage.setItem('auth_token', token)
// }

// export const removeAuthToken = (): void => {
//   if (typeof window === 'undefined') return
//   localStorage.removeItem('auth_token')
// }
