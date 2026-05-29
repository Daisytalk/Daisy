import type { OnboardingStep } from './steps'

/** Required single-choice steps auto-advance and hide the Next button. */
export function isOnboardingSingleChoiceStep(
  step: OnboardingStep | undefined,
  answer: { value?: string } | null,
): boolean {
  if (step?.type !== 'question' || step.required !== true) return false
  if (step.questionType === 'scale') return true
  if (step.questionType === 'relationship' && answer?.value !== 'unsure') return true
  if (step.questionType === 'yes-no-text' && answer?.value !== 'yes') return true
  return false
}

export function isOptionalQuestionStep(step: OnboardingStep | undefined): boolean {
  return step?.type === 'question' && step.required === false
}
