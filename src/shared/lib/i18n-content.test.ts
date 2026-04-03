import { describe, expect, it } from 'vitest'
import { pickLocalizedStringArray, pickMetricInsightsFromDb, pickWeeklySummary } from './i18n-content'

describe('i18n-content', () => {
  it('pickWeeklySummary prefers summary_i18n', () => {
    expect(
      pickWeeklySummary(
        'fallback',
        { en: 'Hello', ru: 'Привет' },
        'ru'
      )
    ).toBe('Привет')
    expect(pickWeeklySummary('fallback', { en: 'Hello', ru: 'Привет' }, 'en')).toBe('Hello')
  })

  it('pickLocalizedStringArray supports legacy array', () => {
    expect(pickLocalizedStringArray(['a', 'b'], 'en')).toEqual(['a', 'b'])
  })

  it('pickLocalizedStringArray supports bilingual object', () => {
    const raw = { en: ['e1'], ru: ['р1', 'р2'] }
    expect(pickLocalizedStringArray(raw, 'ru')).toEqual(['р1', 'р2'])
    expect(pickLocalizedStringArray(raw, 'en')).toEqual(['e1'])
  })

  it('pickMetricInsightsFromDb reads bilingual', () => {
    const raw = {
      en: { emotion: 'e', stress: 's', energy: 'n', support: 'p' },
      ru: { emotion: 'Э', stress: 'С', energy: 'Эн', support: 'П' },
    }
    expect(pickMetricInsightsFromDb(raw, 'ru')).toEqual(raw.ru)
    expect(pickMetricInsightsFromDb(raw, 'en')).toEqual(raw.en)
  })

  it('pickMetricInsightsFromDb reads flat legacy', () => {
    const flat = { emotion: 'a', stress: 'b', energy: 'c', support: 'd' }
    expect(pickMetricInsightsFromDb(flat, 'en')).toEqual(flat)
  })
})
