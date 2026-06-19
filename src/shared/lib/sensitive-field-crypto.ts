/**
 * Encryption at rest for sensitive JSON fields (onboarding responses, conversationMemory).
 * Reuses AES-256-GCM from encryption.ts; pass-through when ENCRYPTION_KEY is unset.
 */

import { encrypt, decrypt } from './encryption'

const PREFIX = 'enc_v1:'

function isEncryptedString(value: string): boolean {
  return value.startsWith(PREFIX)
}

export function prepareSensitiveJsonForStorage(value: unknown): string {
  const json = JSON.stringify(value)
  return encrypt(json)
}

export function getDecryptedSensitiveJson<T = unknown>(stored: unknown): T | null {
  if (stored == null) return null

  if (typeof stored === 'string') {
    if (isEncryptedString(stored)) {
      try {
        return JSON.parse(decrypt(stored)) as T
      } catch {
        return null
      }
    }
    try {
      return JSON.parse(stored) as T
    } catch {
      return stored as T
    }
  }

  return stored as T
}
