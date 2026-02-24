/**
 * Layer 1 PII Redactor — regex-based strip до INSERT в БД.
 * Защищает CbtMessage от хранения PII в открытом виде.
 */

const PII_PATTERNS: Array<{ pattern: RegExp; token: string }> = [
  // Казахстанские телефоны: +7 777 123 45 67 / 87001234567 / 7 (777) 123-45-67
  {
    pattern: /(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g,
    token: '[ТЕЛЕФОН]',
  },
  // Международные телефоны
  {
    pattern: /\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g,
    token: '[ТЕЛЕФОН]',
  },
  // ЖСН / ИИН Казахстан (12 цифр)
  {
    pattern: /\b\d{12}\b/g,
    token: '[ЖСН]',
  },
  // Email
  {
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    token: '[EMAIL]',
  },
  // URL
  {
    pattern: /https?:\/\/[^\s]+/g,
    token: '[ССЫЛКА]',
  },
  // Банковские карты (13–19 цифр с пробелами/дефисами)
  {
    pattern: /\b(?:\d[ \-]?){13,19}\b/g,
    token: '[КАРТА]',
  },
  // Дата рождения (DD.MM.YYYY / DD/MM/YYYY / DD-MM-YYYY)
  {
    pattern: /\b(0?[1-9]|[12]\d|3[01])[.\/\-](0?[1-9]|1[0-2])[.\/\-](19|20)\d{2}\b/g,
    token: '[ДАТА_РОЖДЕНИЯ]',
  },
]

export interface RedactResult {
  redacted: string
  hadPII: boolean
  detectedTypes: string[]
}

export function redactPII(text: string): RedactResult {
  let redacted = text
  const detectedTypes: string[] = []

  for (const { pattern, token } of PII_PATTERNS) {
    const matches = redacted.match(pattern)
    if (matches && matches.length > 0) {
      redacted = redacted.replace(pattern, token)
      if (!detectedTypes.includes(token)) {
        detectedTypes.push(token)
      }
    }
  }

  return {
    redacted,
    hadPII: detectedTypes.length > 0,
    detectedTypes,
  }
}
