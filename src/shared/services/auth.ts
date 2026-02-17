import type { User, LoginCredentials, RegisterCredentials } from '@/shared/types/auth'

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>
  register(credentials: RegisterCredentials): Promise<{ user: User; token: string }>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  refreshToken(): Promise<string>
  forgotPassword(email: string): Promise<{ message: string }>
  resetPassword(token: string, password: string): Promise<{ message: string }>
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
    })
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Отправляем токен и в cookie (credentials: 'include'), и в заголовке — в Azure cookie иногда не доходит
      const headers: HeadersInit = {}
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        return null;
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null
    }
  }

  async refreshToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const { token } = await response.json()
    return token
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send reset email')
    }

    return response.json()
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reset password')
    }

    return response.json()
  }

  async exportAccountData(): Promise<unknown> {
    const headers: HeadersInit = {}
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch('/api/account/export', { credentials: 'include', headers })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Export failed')
    }
    return response.json()
  }

  async clearMemory(): Promise<void> {
    const headers: HeadersInit = {}
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch('/api/account/memory', {
      method: 'DELETE',
      credentials: 'include',
      headers,
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to clear memory')
    }
  }

  async deleteAccount(): Promise<void> {
    const headers: HeadersInit = {}
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch('/api/account/delete', {
      method: 'DELETE',
      credentials: 'include',
      headers,
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to delete account')
    }
  }
}