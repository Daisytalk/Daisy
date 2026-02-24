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
  questionType?: 'scale' | 'multiselect' | 'style-selection' | 'relationship' | 'yes-no-text'
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
    content: 'Привет. Я - Дэйзи 🌼\n\nЯ рада, что ты заглянула сюда 🤍 Здесь можно выдохнуть, разобраться в себе и почувствовать поддержку. Чтобы сразу быть рядом так, как нужно именно тебе, хочу задать пару вопросов. Это займет 2-3 минуты.',
    buttonLabel: 'Начать',
  },
  // ─── БЛОК 1: Эмоциональное состояние ─────────────────────────────────────
  {
    id: 'mood_today',
    type: 'question',
    section: 'emotional-start',
    questionId: 'mood_today',
    question: 'Расскажи, как ты себя чувствуешь? Здесь можно быть собой 🤍',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'transition_thanks',
    type: 'transition',
    section: 'emotional-start',
    content: 'Спасибо, что доверяешь мне это 🤍\n\nЯ бережно собираю всё, что ты рассказываешь, чтобы это место стало по-настоящему твоим',
    buttonLabel: 'Далее',
  },
  {
    id: 'support_needs',
    type: 'question',
    section: 'emotional-start',
    questionId: 'support_needs',
    question: 'Что сейчас важнее всего для тебя? Выбери до 2 и я буду знать с чего начать:',
    questionType: 'multiselect',
    options: [
      'Снизить тревогу',
      'Справиться с усталостью / выгоранием',
      'Разобраться в чувствах',
      'Получить поддержку',
      'Наладить отношения',
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
    question: 'Как тебе комфортнее всего общаться? Выбери 1-2 стиля:',
    questionType: 'style-selection',
    maxSelect: 2,
    required: true,
  },
  // ─── БЛОК 2: Состояние жизненных сфер ─────────────────────────────────────
  {
    id: 'transition_portrait',
    type: 'transition',
    section: 'life-areas',
    content: 'Спасибо, что отвечаешь так честно 🤍\n\nЯ уже начинаю понимать, что для тебя важно. Совсем скоро твоё пространство будет готово - только для тебя',
    buttonLabel: 'Далее',
  },
  {
    id: 'work_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'work_state',
    question: 'Как тебе сейчас в работе или учёбе? 🤍',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'relationships',
    type: 'question',
    section: 'life-areas',
    questionId: 'relationships',
    question: 'Есть ли рядом кто-то близкий: партнёр или человек, с которым вы вместе?',
    questionType: 'relationship',
    required: true,
  },
  {
    id: 'family_support',
    type: 'question',
    section: 'life-areas',
    questionId: 'family_support',
    question: 'Есть ли рядом люди, на которых можно опереться? 🤍 (семья, друзья)',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'social_support',
    type: 'question',
    section: 'life-areas',
    questionId: 'social_support',
    question: 'Как тебе круг общения: друзья, коллеги, знакомые? 🤍',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'solo_comfort',
    type: 'question',
    section: 'life-areas',
    questionId: 'solo_comfort',
    question: 'Как тебе наедине с собой - без компании, в тишине? 🤍',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'physical_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'physical_state',
    question: 'Как ты себя чувствуешь физически в последнее время? 🤍',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'emo_state',
    type: 'question',
    section: 'life-areas',
    questionId: 'emo_state',
    question: 'Что происходит внутри в последнее время: как твоё эмоциональное состояние? 🤍',
    questionType: 'scale',
    required: true,
  },
  {
    id: 'leisure',
    type: 'question',
    section: 'life-areas',
    questionId: 'leisure',
    question: 'Как тебе удаётся отдыхать и получать удовольствие от досуга? 🤍',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'housing',
    type: 'question',
    section: 'life-areas',
    questionId: 'housing',
    question: 'Как ты себя чувствуешь в своём жилье? 🤍',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'finance',
    type: 'question',
    section: 'life-areas',
    questionId: 'finance',
    question: 'Как обстоят дела с финансами в последнее время? 🤍',
    questionType: 'scale',
    required: false,
  },
  {
    id: 'family_history',
    type: 'question',
    section: 'life-areas',
    questionId: 'family_history',
    question: 'Есть ли в семье наследственная предрасположенность к психическим или эмоциональным расстройствам? (можно не отвечать)',
    questionType: 'yes-no-text',
    required: false,
  },
  {
    id: 'chronic',
    type: 'question',
    section: 'life-areas',
    questionId: 'chronic',
    question: 'Есть ли у тебя хронические заболевания, которые влияют на самочувствие? (можно не отвечать)',
    questionType: 'yes-no-text',
    required: false,
  },
  {
    id: 'addiction',
    type: 'question',
    section: 'life-areas',
    questionId: 'addiction',
    question: 'Есть ли зависимости (алкоголь, курение, другое), которые тебя беспокоят? (можно не отвечать)',
    questionType: 'yes-no-text',
    required: false,
  },
  // ─── Завершение опроса ────────────────────────────────────────────────────
  {
    id: 'final',
    type: 'final',
    section: 'final',
    content: 'Спасибо, что ты была так честна со мной 🤍\n\nОтветить на такие вопросы - уже смелость. Я вижу, что для тебя сейчас важно, и я здесь именно для этого. Будем вместе работать над этим - шаг за шагом, в твоём ритме.',
    buttonLabel: 'Начать диалог',
  },
]

export const SECTION_LABELS: Record<string, string> = {
  'emotional-start': 'Эмоциональное состояние',
  'life-areas': 'Состояние жизненных сфер',
  'final': 'Завершение опроса',
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
  '1 - совсем тяжело - сил почти нет',
  '2 - непросто, много напряжения',
  '3 - справляюсь, но радости мало',
  '4 - в целом хорошо, есть стабильность',
  '5 - всё отлично: есть и смысл и энергия',
]

export const SCALE_LABELS_REL = [
  '1 - очень тяжело: много боли и напряжения',
  '2 - нестабильно, бывает непросто',
  '3 - спокойно, но чего-то не хватает',
  '4 - хорошо, чувствую поддержку и тепло',
  '5 - стабильно, тепло и по-настоящему близко',
]

export const SCALE_LABELS_FAMILY = [
  '1 - чувствую себя одиноко, опереться не на кого',
  '2 - бывает тяжело, отношения непростые',
  '3 - всё ровно, но настоящей близости не хватает',
  '4 - есть люди, к которым могу обратиться',
  '5 - тепло и надёжно: есть те, кто всегда рядом',
]

export const SCALE_LABELS_SOLO = [
  '1 - одиночество пугает: бывает тревожно или совсем не по себе',
  '2 - неуютно, стараюсь быть среди людей',
  '3 - нейтрально, терплю, но не наслаждаюсь',
  '4 - скорее комфортно, умею проводить время с собой',
  '5 - люблю время наедине с собой - это моя перезагрузка',
]

export const SCALE_LABELS_PHYSICAL = [
  '1 - плохой сон, нет энергии, часто заболеваю',
  '2 - часто устаю, сон нестабильный',
  '3 - терпимо, но тело иногда даёт о себе знать',
  '4 - в большинстве дней чувствую себя неплохо',
  '5 - всё в порядке - есть и сон, и силы, и энергия',
]

export const SCALE_LABELS_EMO = [
  '1 - очень тяжело - тревога или пустота почти не отпускают',
  '2 - нестабильно: настроение скачет, бывает срываюсь',
  '3 - по-разному - то лучше, то хуже, стабильности не хватает',
  '4 - в целом справляюсь, есть опора внутри',
  '5 - чувствую себя устойчиво - есть силы и внутренний баланс',
]
