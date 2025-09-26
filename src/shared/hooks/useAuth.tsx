'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '@/shared/types/auth'
import { AuthApiService } from '@/shared/services/auth'
import { getAuthToken, setAuthToken, removeAuthToken } from '@/shared/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })

  const authService = new AuthApiService()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      const user = await authService.getCurrentUser()
      setState(prev => ({ ...prev, user, isLoading: false }))
    } catch (err) {
      removeAuthToken()
      setState(prev => ({ ...prev, user: null, isLoading: false }))
    }
  }

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const { user, token } = await authService.login(credentials)
      setAuthToken(token)
      setState(prev => ({ ...prev, user, isLoading: false }))
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false 
      }))
      throw err
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const { user, token } = await authService.register(credentials)
      setAuthToken(token)
      setState(prev => ({ ...prev, user, isLoading: false }))
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Registration failed',
        isLoading: false 
      }))
      throw err
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await authService.logout()
      removeAuthToken()
      setState({ user: null, isLoading: false, error: null })
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const contextValue: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === null) {
    // This condition is met on the server (for SSR/prerendering) or on the client
    // if the component is not wrapped in AuthProvider.

    if (typeof window !== 'undefined') {
      // On the client, this is a developer error.
      throw new Error('useAuth must be used within an AuthProvider')
    }

    // On the server, we return a mock state to prevent errors during build.
    // Components using this hook should be wrapped in <ClientOnly> to avoid
    // rendering anything that depends on the auth state on the server.
    return {
      user: null,
      isLoading: true,
      error: null,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      clearError: () => {},
    }
  }

  return context
}