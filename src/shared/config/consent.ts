export const CURRENT_CONSENT_VERSION = '2026-06-01'

export const REQUIRED_CONSENT_TYPES = ['health_data', 'ml_processing'] as const

export type ConsentType = (typeof REQUIRED_CONSENT_TYPES)[number]
