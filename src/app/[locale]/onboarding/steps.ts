/**
 * Production onboarding steps (НОВЫЙ ОНБОРДИНГ+СКОРИНГ.docx)
 * Блоки: ЭМОЦИОНАЛЬНЫЙ СТАРТ | СОСТОЯНИЕ ЖИЗНЕННЫХ СФЕР | ФИНАЛ ОПРОСНИКА
 */

export type StepType = 'welcome' | 'transition' | 'question' | 'final'

export interface OnboardingStep {
  id: string
  type: StepType
  section: 'emotional-start' | 'life-areas' | 'final'
  /** Для question: id вопроса (mood_today, support_needs, etc.) */
  questionId?: string
  question?: string
  questionType?: 'scale' | 'multiselect' | 'style-selection' | 'relationship'
  options?: string[]
  maxSelect?: number
  required?: boolean
  /** Текст для welcome/transition/final */
  content?: string
  buttonLabel?: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // ─── ЭКРАН 0: Мягкий вход ─────────────────────────────────────────────────
  {
    id: 'welcome',
    type: 'welcome',
    section: 'emotional-start',
    content: 'Привет. Я - Дэйзи 🌼\n\nЯ буду вашим личным AI-помощником для эмоциональной поддержки и понимания себя. Чтобы я могла быть полезной, задам несколько вопросов. Это займёт 2–3 минуты.',
    buttonLabel: 'Начать',
  },
  // ─── БЛОК 1: ЭМОЦИОНАЛЬНЫЙ СТАРТ ─────────────────────────────────────────
  {
    id: 'mood_today',
    type: 'question',
    section: 'emotional-start',
    questionId: 'mood_today',
    question: 'Как ты себя чувствуешь сегодня?',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'support_needs',
    type: 'question',
    section: 'emotional-start',
    questionId: 'support_needs',
    question: 'Где тебе сейчас нужна моя поддержка? (выбери до 2)',
    questionType: 'multiselect',
    options: [
      'Снизить тревогу',
      'Справиться с усталостью / выгоранием',
      'Разобраться в чувствах',
      'Получить поддержку',
      'Улучшить отношения',
      'Наладить отношения с собой',
      'Вернуть энергию',
      'Просто выговориться',
      'Другое',
    ],
    maxSelect: 2,
    required: true,
  },
  {
    id: 'communication_style',
    type: 'question',
    section: 'emotional-start',
    questionId: 'communication_style',
    question: 'Как бы ты хотел/а, чтобы я с тобой общалась? (Выбери до 2 стилей)',
    questionType: 'style-selection',
    maxSelect: 2,
    required: true,
  },
  {
    id: 'transition_thanks',
    type: 'transition',
    section: 'emotional-start',
    content: 'Спасибо, что делишься\n\nЯ бережно собираю всё, что ты рассказываешь - чтобы создать пространство, которое будет по-настоящему твоим.',
  },
  // ─── БЛОК 2: СОСТОЯНИЕ ЖИЗНЕННЫХ СФЕР ─────────────────────────────────────
  {
    id: 'transition_portrait',
    type: 'transition',
    section: 'life-areas',
    content: 'Уже складывается твой портрет\n\nТвои ответы помогают мне понять, что для тебя по-настоящему важно. Ещё немного и твоё пространство будет готово.',
  },
  {
    id: 'work_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'work_state',
    question: 'Насколько комфортно тебе в работе или учёбе прямо сейчас?',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'relationships',
    type: 'question',
    section: 'life-areas',
    questionId: 'relationships',
    question: 'Состоишь ли ты сейчас в отношениях?',
    questionType: 'relationship',
    required: true,
  },
  {
    id: 'family_support',
    type: 'question',
    section: 'life-areas',
    questionId: 'family_support',
    question: 'Чувствуешь ли ты поддержку от близких людей в своей жизни? (семьи, друзей)',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'solo_comfort',
    type: 'question',
    section: 'life-areas',
    questionId: 'solo_comfort',
    question: 'Насколько комфортно тебе быть одной?',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'physical_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'physical_state',
    question: 'Как ты себя чувствуешь физически в последнее время?',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'emo_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'emo_state',
    question: 'Как ты себя чувствуешь эмоционально в последнее время?',
    questionType: 'scale',
    required: true,
  },
  // ─── ФИНАЛ ────────────────────────────────────────────────────────────────
  {
    id: 'final',
    type: 'final',
    section: 'final',
    content: 'Спасибо, что доверилась мне\n\nЭто был важный шаг - честно ответить на вопросы о себе. Я уже многое о тебе знаю и вижу, где тебе сейчас тяжелее всего.',
    buttonLabel: 'Начать диалог',
  },
]

export const SECTION_LABELS: Record<string, string> = {
  'emotional-start': 'ЭМОЦИОНАЛЬНЫЙ СТАРТ',
  'life-areas': 'СОСТОЯНИЕ ЖИЗНЕННЫХ СФЕР',
  'final': 'ФИНАЛ ОПРОСНИКА',
}

/** SVG иконки для шкалы 1-5 (sad → disappointed → normal → peaceful → happy) */
export const SCALE_ICONS = [
  '/images/sad.svg',
  '/images/disappointed.svg',
  '/images/normal.svg',
  '/images/peaceful.svg',
  '/images/happy.svg',
]

export const SCALE_LABELS = [
  'Очень тяжело',
  'Скорее плохо',
  'Нормально',
  'Скорее хорошо',
  'В ресурсе',
]

export const SCALE_LABELS_WORK = [
  '1 - очень тяжело, нет сил, выгорание',
  '2 - скорее плохо, много стресса',
  '3 - средне, справляюсь, но без удовольствия',
  '4 - скорее хорошо, в целом доволен(а)',
  '5 - всё отлично, чувствую смысл и энергию',
]

export const SCALE_LABELS_REL = [
  '1 - много конфликтов, нет поддержки, токсично',
  '2 - скорее нестабильно, бывает тяжело',
  '3 - средне, всё спокойно, но нет глубины',
  '4 - скорее хорошо, чувствую поддержку',
  '5 - стабильно, тепло и взаимно',
]

export const SCALE_LABELS_FAMILY = [
  '1 - много конфликтов, нет поддержки',
  '2 - скорее напряжённо, бывают срывы',
  '3 - нейтрально, без конфликтов, но и без близости',
  '4 - скорее поддерживающая, могу обратиться за помощью',
  '5 - тепло и стабильно, семья - моя опора',
]

export const SCALE_LABELS_SOLO = [
  '1 - очень некомфортно, одиночество вызывает тревогу или панику',
  '2 - скорее тревожно, стараюсь избегать одиночества',
  '3 - нейтрально, терплю, но не наслаждаюсь',
  '4 - скорее комфортно, умею проводить время с собой',
  '5 - полностью комфортно, ценю время наедине с собой',
]

export const SCALE_LABELS_PHYSICAL = [
  '1 - плохой сон, нет энергии, часто заболеваю',
  '2 - скорее плохо, часто усталость, нерегулярный сон',
  '3 - средне, в целом терпимо, но есть проблемы',
  '4 - скорее хорошо, большинство дней чувствую себя стабильно',
  '5 - отлично, сон, питание и энергия - всё в порядке',
]

export const SCALE_LABELS_EMO = [
  '1 - постоянная тревога или подавленность, трудно функционировать',
  '2 - часто дискомфортно, перепады настроения, раздражительность',
  '3 - бывает по-разному, нет стабильности',
  '4 - в основном стабильно, справляюсь с трудностями',
  '5 - эмоционально устойчив(а), чувствую себя в ресурсе',
]
