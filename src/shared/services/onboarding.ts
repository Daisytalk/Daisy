import type { OnboardingSection, OnboardingQuestion, OnboardingAnswer, OnboardingData } from '@/shared/types/auth'

export interface IOnboardingService {
  getQuestions(): Promise<OnboardingSection[]>
  submitAnswers(answers: OnboardingAnswer[]): Promise<void>
  getOnboardingData(userId: string): Promise<OnboardingData | null>
  addQuestion(question: Omit<OnboardingQuestion, 'id'>): Promise<OnboardingQuestion>
  updateQuestion(id: string, question: Partial<OnboardingQuestion>): Promise<OnboardingQuestion>
  deleteQuestion(id: string): Promise<void>
}

export class OnboardingApiService implements IOnboardingService {
  private baseUrl = '/api/onboarding'

  async getQuestions(): Promise<OnboardingSection[]> {
    const response = await fetch(`${this.baseUrl}/questions`)

    if (!response.ok) {
      throw new Error('Failed to fetch onboarding questions')
    }

    return response.json()
  }

  async submitAnswers(answers: OnboardingAnswer[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/submit`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const msg = error.detail || error.message || `HTTP ${response.status}`
      throw new Error(msg)
    }
  }

  async getOnboardingData(userId: string): Promise<OnboardingData | null> {
    const response = await fetch(`${this.baseUrl}/data/${userId}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch onboarding data')
    }

    return response.json()
  }

  async addQuestion(question: Omit<OnboardingQuestion, 'id'>): Promise<OnboardingQuestion> {
    const response = await fetch(`${this.baseUrl}/questions`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to add question')
    }

    return response.json()
  }

  async updateQuestion(id: string, question: Partial<OnboardingQuestion>): Promise<OnboardingQuestion> {
    const response = await fetch(`${this.baseUrl}/questions/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update question')
    }

    return response.json()
  }

  async deleteQuestion(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/questions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete question')
    }
  }
}
