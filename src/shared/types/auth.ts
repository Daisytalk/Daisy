export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  isOnboarded: boolean
  trialEndsAt?: Date | null
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired'
  createdAt: Date
  updatedAt: Date
}

export interface OnboardingQuestion {
  id: string
  type: 'single-choice' | 'multiple-choice' | 'text' | 'scale' | 'boolean'
  question: string
  options?: string[]
  required: boolean
  order: number
}

export interface OnboardingAnswer {
  questionId: string
  answer: string | string[] | number | boolean
}

export interface OnboardingData {
  userId: string
  answers: OnboardingAnswer[]
  completedAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}