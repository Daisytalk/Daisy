import type { User, LoginCredentials, RegisterCredentials } from '@/shared/types/auth'

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>
  register(credentials: RegisterCredentials): Promise<{ user: User; token: string }>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  refreshToken(): Promise<string>
}

export class AuthApiService implements IAuthService {
  private baseUrl = '/api/auth'

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    return response.json()
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    return response.json()
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
    })
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    try {
      // For now, return null since we removed the /me endpoint
      // In a real app, you'd decode the JWT token or use a different approach
      return null
    } catch (error) {
      return null
    }
  }

  async refreshToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const { token } = await response.json()
    return token
  }
}