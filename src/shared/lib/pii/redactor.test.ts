/**
 * Layer 1 PII redactor — smoke tests.
 * Run: pnpm test:pii
 */

import { describe, it, expect } from 'vitest'
import { redactPII } from './redactor'

describe('redactPII', () => {
  const cases: Array<{ input: string; expectPII: boolean; expectContains: string[] }> = [
    { input: 'Меня зовут Алия, мой номер +7 777 123 45 67', expectPII: true, expectContains: ['[ТЕЛЕФОН]'] },
    { input: 'пиши на aliya@gmail.com', expectPII: true, expectContains: ['[EMAIL]'] },
    { input: 'мой ЖСН 960312350012', expectPII: true, expectContains: ['[ЖСН]'] },
    { input: 'я родился 03.03.1994', expectPII: true, expectContains: ['[ДАТА_РОЖДЕНИЯ]'] },
    { input: 'живу на https://2gis.kz/astana/street/123', expectPII: true, expectContains: ['[ССЫЛКА]'] },
    { input: 'карта 4111 1111 1111 1111', expectPII: true, expectContains: ['[КАРТА]'] },
    { input: '8 (701) 234-56-78 позвони мне', expectPII: true, expectContains: ['[ТЕЛЕФОН]'] },
    { input: 'стресс на работе сильный', expectPII: false, expectContains: [] },
    { input: 'мне тяжело, не могу спать', expectPII: false, expectContains: [] },
  ]

  cases.forEach(({ input, expectPII, expectContains }) => {
    it(`"${input.slice(0, 45)}..." maps to PII=${expectPII}`, () => {
      const r = redactPII(input)
      expect(r.hadPII).toBe(expectPII)
      expectContains.forEach((token) => {
        expect(r.redacted).toContain(token)
      })
      if (!expectPII) {
        expect(r.redacted).toBe(input)
      }
    })
  })
})
