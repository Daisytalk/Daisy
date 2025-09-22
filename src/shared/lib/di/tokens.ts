// Service tokens for DI
export const TOKENS = {
  // Database
  DATABASE: Symbol('DATABASE'),
  
  // Analytics
  ANALYTICS_SERVICE: Symbol('ANALYTICS_SERVICE'),
  
  // Payment
  PAYMENT_SERVICE: Symbol('PAYMENT_SERVICE'),
  
  // Email
  EMAIL_SERVICE: Symbol('EMAIL_SERVICE'),
  
  // AI Services
  AI_SERVICE: Symbol('AI_SERVICE'),
  VERTEX_AI_SERVICE: Symbol('VERTEX_AI_SERVICE'),
  
  // Repositories
  USER_REPOSITORY: Symbol('USER_REPOSITORY'),
  ONBOARDING_REPOSITORY: Symbol('ONBOARDING_REPOSITORY'),
} as const