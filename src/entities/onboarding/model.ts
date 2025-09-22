export interface OnboardingData {
  id: string
  userId: string
  responses: Record<string, any>
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateOnboardingData {
  userId: string
  responses: Record<string, any>
  completed?: boolean
}

export interface UpdateOnboardingData {
  responses?: Record<string, any>
  completed?: boolean
}

// Onboarding step types for type safety
export interface OnboardingStep {
  id: string
  title: string
  description: string
  type: 'text' | 'select' | 'multiselect' | 'scale' | 'boolean'
  options?: string[]
  required: boolean
}

export interface OnboardingResponse {
  stepId: string
  value: any
}