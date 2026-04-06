/**
 * Production onboarding steps (НОВЫЙ ОНБОРДИНГ+СКОРИНГ.docx)
 * Copy lives in messages (onboarding.flow.*); this file is structure + stable option keys only.
 */

export type StepType = 'welcome' | 'transition' | 'question' | 'final'

export interface OnboardingStep {
  id: string
  type: StepType
  section: 'emotional-start' | 'life-areas' | 'final'
  questionId?: string
  questionType?: 'scale' | 'multiselect' | 'style-selection' | 'relationship' | 'yes-no-text'
  /** Stable keys for multiselect; labels from onboarding.flow.supportNeeds.options.<key> */
  optionKeys?: readonly string[]
  maxSelect?: number
  required?: boolean
  contentKey?: string
  buttonKey?: string
  questionKey?: string
}

/** Stored in answers / API — locale-independent */
export const SUPPORT_NEED_OPTION_KEYS = [
  'reduce_anxiety',
  'fatigue_burnout',
  'sort_feelings',
  'get_support',
  'relationships',
  'relationship_with_self',
  'regain_energy',
  'vent',
  'other',
] as const

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    type: 'welcome',
    section: 'emotional-start',
    contentKey: 'flow.steps.welcome.content',
    buttonKey: 'flow.steps.welcome.button',
  },
  {
    id: 'mood_today',
    type: 'question',
    section: 'emotional-start',
    questionId: 'mood_today',
    questionKey: 'flow.steps.mood_today.question',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'transition_thanks',
    type: 'transition',
    section: 'emotional-start',
    contentKey: 'flow.steps.transition_thanks.content',
    buttonKey: 'flow.steps.transition_thanks.button',
  },
  {
    id: 'support_needs',
    type: 'question',
    section: 'emotional-start',
    questionId: 'support_needs',
    questionKey: 'flow.steps.support_needs.question',
    questionType: 'multiselect',
    optionKeys: SUPPORT_NEED_OPTION_KEYS,
    maxSelect: 2,
    required: true,
  },
  {
    id: 'communication_style',
    type: 'question',
    section: 'emotional-start',
    questionId: 'communication_style',
    questionKey: 'flow.steps.communication_style.question',
    questionType: 'style-selection',
    maxSelect: 2,
    required: true,
  },
  {
    id: 'transition_portrait',
    type: 'transition',
    section: 'life-areas',
    contentKey: 'flow.steps.transition_portrait.content',
    buttonKey: 'flow.steps.transition_portrait.button',
  },
  {
    id: 'work_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'work_state',
    questionKey: 'flow.steps.work_state.question',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'relationships',
    type: 'question',
    section: 'life-areas',
    questionId: 'relationships',
    questionKey: 'flow.steps.relationships.question',
    questionType: 'relationship',
    required: true,
  },
  {
    id: 'family_support',
    type: 'question',
    section: 'life-areas',
    questionId: 'family_support',
    questionKey: 'flow.steps.family_support.question',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'social_support',
    type: 'question',
    section: 'life-areas',
    questionId: 'social_support',
    questionKey: 'flow.steps.social_support.question',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'solo_comfort',
    type: 'question',
    section: 'life-areas',
    questionId: 'solo_comfort',
    questionKey: 'flow.steps.solo_comfort.question',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'physical_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'physical_state',
    questionKey: 'flow.steps.physical_state.question',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'emo_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'emo_state',
    questionKey: 'flow.steps.emo_state.question',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'leisure',
    type: 'question',
    section: 'life-areas',
    questionId: 'leisure',
    questionKey: 'flow.steps.leisure.question',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'housing',
    type: 'question',
    section: 'life-areas',
    questionId: 'housing',
    questionKey: 'flow.steps.housing.question',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'finance',
    type: 'question',
    section: 'life-areas',
    questionId: 'finance',
    questionKey: 'flow.steps.finance.question',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'family_history',
    type: 'question',
    section: 'life-areas',
    questionId: 'family_history',
    questionKey: 'flow.steps.family_history.question',
    questionType: 'yes-no-text',
    required: false,
  },
  {
    id: 'chronic',
    type: 'question',
    section: 'life-areas',
    questionId: 'chronic',
    questionKey: 'flow.steps.chronic.question',
    questionType: 'yes-no-text',
    required: false,
  },
  {
    id: 'addiction',
    type: 'question',
    section: 'life-areas',
    questionId: 'addiction',
    questionKey: 'flow.steps.addiction.question',
    questionType: 'yes-no-text',
    required: false,
  },
  {
    id: 'final',
    type: 'final',
    section: 'final',
    contentKey: 'flow.steps.final.content',
    buttonKey: 'flow.steps.final.button',
  },
]

export const SECTION_LABEL_KEYS: Record<string, string> = {
  'emotional-start': 'flow.sections.emotional-start',
  'life-areas': 'flow.sections.life-areas',
  final: 'flow.sections.final',
}

/** Maps questionId → scale group key under onboarding.flow.scale.<group> */
export const QUESTION_SCALE_GROUP: Record<string, string> = {
  mood_today: 'default',
  work_state: 'work',
  rel_quality: 'rel',
  family_support: 'family',
  social_support: 'family',
  solo_comfort: 'solo',
  physical_state: 'physical',
  emo_state: 'emo',
  leisure: 'default',
  housing: 'default',
  finance: 'default',
}

/** SVG иконки для шкалы 1-5 (sad → disappointed → normal → peaceful → happy) */
export const SCALE_ICONS = [
  '/images/sad.svg',
  '/images/disappointed.svg',
  '/images/normal.svg',
  '/images/peaceful.svg',
  '/images/happy.svg',
]

export const COMMUNICATION_STYLE_IDS = [
  'warm_friend',
  'practical_helper',
  'gentle_explorer',
  'calm_mentor',
  'wise_teacher',
  'flexible_companion',
] as const
