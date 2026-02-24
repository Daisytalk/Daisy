/**
 * Шифрование/дешифрование content для CbtMessage.
 * Централизованная точка для encryption at rest.
 */

import { encrypt, decrypt } from './encryption'

export function prepareContentForStorage(content: string): string {
  return encrypt(content)
}

export function getDecryptedContent(content: string): string {
  return decrypt(content)
}

export function withDecryptedContent<T extends { content: string }>(msg: T): T & { content: string } {
  return { ...msg, content: getDecryptedContent(msg.content) }
}
