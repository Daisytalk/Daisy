/**
 * Encryption at rest для CbtMessage.content.
 * AES-256-GCM. При отсутствии ENCRYPTION_KEY — pass-through (обратная совместимость).
 */

import crypto from 'crypto'

const PREFIX = 'enc_v1:'
const IV_LEN = 12
const AUTH_TAG_LEN = 16

function getKey(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw || raw.trim().length < 16) return null
  return crypto.createHash('sha256').update(raw, 'utf8').digest()
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  if (!key) return plaintext

  const iv = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LEN })
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  const combined = Buffer.concat([iv, tag, enc])
  return PREFIX + combined.toString('base64url')
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  if (!key || !ciphertext.startsWith(PREFIX)) return ciphertext

  try {
    const raw = Buffer.from(ciphertext.slice(PREFIX.length), 'base64url')
    const iv = raw.subarray(0, IV_LEN)
    const tag = raw.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN)
    const enc = raw.subarray(IV_LEN + AUTH_TAG_LEN)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LEN })
    decipher.setAuthTag(tag)
    return decipher.update(enc) + decipher.final('utf8')
  } catch {
    return ciphertext
  }
}
