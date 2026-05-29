import { describe, expect, it } from 'vitest'
import { isOnboardingSingleChoiceStep, isOptionalQuestionStep } from './navigation'
import type { OnboardingStep } from './steps'

const optionalYesNo: OnboardingStep = {
  id: 'family_history',
  type: 'question',
  section: 'life-areas',
  questionId: 'family_history',
  questionType: 'yes-no-text',
  required: false,
}

const requiredScale: OnboardingStep = {
  id: 'mood_today',
  type: 'question',
  section: 'emotional-start',
  questionId: 'mood_today',
  questionType: 'scale',
  required: true,
}

describe('onboarding navigation', () => {
  it('optional yes-no without answer is not single-choice (Next/Skip visible)', () => {
    expect(isOnboardingSingleChoiceStep(optionalYesNo, null)).toBe(false)
    expect(isOptionalQuestionStep(optionalYesNo)).toBe(true)
  })

  it('required scale is single-choice for auto-advance', () => {
    expect(isOnboardingSingleChoiceStep(requiredScale, null)).toBe(true)
    expect(isOptionalQuestionStep(requiredScale)).toBe(false)
  })

  it('optional scale is not single-choice', () => {
    const optionalScale: OnboardingStep = {
      ...requiredScale,
      id: 'social_support',
      questionId: 'social_support',
      required: false,
    }
    expect(isOnboardingSingleChoiceStep(optionalScale, null)).toBe(false)
  })
})
