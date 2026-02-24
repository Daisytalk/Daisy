/**
 * Encryption at rest — smoke tests.
 * Run: pnpm test src/shared/lib/encryption
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { encrypt, decrypt } from './encryption'

describe('encryption', () => {
  const originalEnv = process.env.ENCRYPTION_KEY

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'test-key-32-chars-long-for-aes'
  })

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalEnv
  })

  it('encrypts and decrypts round-trip', () => {
    const plain = 'Привет, это тестовое сообщение'
    const enc = encrypt(plain)
    expect(enc).not.toBe(plain)
    expect(enc).toMatch(/^enc_v1:/)
    expect(decrypt(enc)).toBe(plain)
  })

  it('without key returns plaintext', () => {
    process.env.ENCRYPTION_KEY = ''
    const plain = 'hello'
    expect(encrypt(plain)).toBe(plain)
    expect(decrypt(plain)).toBe(plain)
  })

  it('decrypt of non-encrypted returns as-is', () => {
    const plain = 'обычный текст'
    expect(decrypt(plain)).toBe(plain)
  })
})
