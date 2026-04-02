import crypto from 'crypto'

function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

/** Сравнение с защитой от timing-attack (фиксированная длина SHA-256). */
export function adminStringsEqual(a: string, b: string): boolean {
  const ha = sha256Hex(a)
  const hb = sha256Hex(b)
  try {
    return crypto.timingSafeEqual(Buffer.from(ha, 'hex'), Buffer.from(hb, 'hex'))
  } catch {
    return false
  }
}
