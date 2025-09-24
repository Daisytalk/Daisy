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

export type OnboardingQuestionType =
  | 'date'
  | 'single-choice'
  | 'scale-with-comment'
  | 'text';

export interface OnboardingQuestion {
  id: string;
  order: number;
  type: OnboardingQuestionType;
  question: string;
  required: boolean;
  options?: string[]; // For single-choice
  commentLabel?: string; // For scale-with-comment
}

export interface OnboardingSection {
  id: string;
  title: string;
  questions: OnboardingQuestion[];
}

export type OnboardingAnswerValue = string | number | boolean | string[] | { rating: number; comment: string } | null;

export interface OnboardingAnswer {
  questionId: string
  answer: OnboardingAnswerValue;
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
