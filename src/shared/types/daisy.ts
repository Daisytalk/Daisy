/**
 * Canonical types for the Daisy AI response pipeline.
 * Single source of truth — replace parallel definitions incrementally.
 */

export type DaisyState =
  | 'intake'
  | 'disclosure'
  | 'psychoeducation'
  | 'action_planning'
  | 'crisis'

export interface DaisyDebugContext {
  has_onboarding: boolean
  has_memory: boolean
  has_persona: boolean
  user_gender: 'male' | 'female' | null
  prompt_tokens: number
  router_plan: { mode: string; tone: string; focus: string; risk: string } | null
  router_enabled: boolean
  coordinator_backend: 'off' | 'hf' | 'azure'
  has_user_image: boolean
  daisy_state: DaisyState
}

export interface DaisySuccessResponse {
  response: string
  persona_used: string
  protocol_used: string
  language: string
  model: string
  translation_enabled: boolean
  crisis_detected: false
  disclaimer_ru: string
  disclaimer_en: string
  debug_context: DaisyDebugContext
  ai_profile?: {
    summary: string
    goals: string[]
    concerns: string[]
    communication_style: string
    updatedAt: string
  }
  memory_update?: string[]
}

export interface DaisyCrisisResponse {
  response: string
  persona_used: string
  protocol_used: string
  language: string
  model: string
  translation_enabled: boolean
  crisis_detected: true
  crisis_resources: Array<{ name: string; contact: string }>
  disclaimer_ru: string
  disclaimer_en: string
  debug_context?: Partial<DaisyDebugContext>
}

export interface DaisyErrorResponse {
  error: string
  model: string
}

export type DaisyResponse =
  | DaisySuccessResponse
  | DaisyCrisisResponse
  | DaisyErrorResponse

export function isDaisyError(r: DaisyResponse): r is DaisyErrorResponse {
  return 'error' in r
}

export function isDaisyCrisis(r: DaisyResponse): r is DaisyCrisisResponse {
  return 'crisis_detected' in r && r.crisis_detected === true
}

export function isDaisySuccess(r: DaisyResponse): r is DaisySuccessResponse {
  return 'response' in r && 'debug_context' in r && !('error' in r)
}
