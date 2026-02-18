import { NextResponse } from 'next/server'
import type { OnboardingSection } from '@/shared/types/auth'
import { apiMessages } from '@/shared/api-messages'

const sections: OnboardingSection[] = [
  {
    id: 'basic-info',
    title: 'I. БАЗОВАЯ ИНФОРМАЦИЯ',
    questions: [
      {
        id: 'gender',
        order: 1,
        type: 'single-choice',
        question: 'Укажите ваш пол',
        options: ['Мужской', 'Женский', 'Другое', 'Предпочитаю не указывать'],
        required: true,
      },
      {
        id: 'family-history',
        order: 2,
        type: 'yes-no-conditional-text',
        question: 'Есть ли у ваших близких родственников диагностированные заболевания, которые могут передаваться по наследству? Например: шизофрения, диабет, сердечно-сосудистые заболевания, онкология, эпилепсия',
        required: true,
      },
      {
        id: 'physical-health',
        order: 3,
        type: 'yes-no-conditional-text',
        question: 'Есть ли у вас хронические или регулярно беспокоящие вас физические заболевания? Например: астма, мигрени, проблемы с ЖКТ, гормональный дисбаланс, боли в спине, нарушения сна',
        required: true,
      },
      {
        id: 'addictions',
        order: 4,
        type: 'yes-no-conditional-multiselect',
        question: 'Замечаете ли вы у себя зависимость от каких-либо веществ или поведенческих паттернов? Например: алкоголь, курение, наркотики, азартные игры, интернет, еда',
        required: true,
        conditionalOptions: ['Алкоголь', 'Курение', 'Наркотики', 'Азартные игры', 'Интернет / соцсети', 'Еда', 'Другое'],
      },
    ],
  },
  {
    id: 'life-areas',
    title: 'II. ОЦЕНКА СФЕР ЖИЗНИ (шкала 1–5)',
    questions: [
      {
        id: 'professional-life',
        order: 5,
        type: 'scale-with-comment',
        question: 'Как вы оцениваете своё состояние в сфере работы или учёбы?',
        required: true,
      },
      {
        id: 'romantic-relationships',
        order: 6,
        type: 'yes-no-conditional-scale',
        question: 'Как вы оцениваете качество ваших романтических отношений?',
        required: true,
      },
      {
        id: 'family-relationships',
        order: 7,
        type: 'scale-with-comment',
        question: 'Как вы оцениваете атмосферу и поддержку в вашей семье?',
        required: true,
      },
      {
        id: 'social-relationships',
        order: 8,
        type: 'scale-with-comment',
        question: 'Насколько вы ощущаете поддержку и близость в вашем круге общения?',
        required: true,
      },
      {
        id: 'autonomy',
        order: 9,
        type: 'scale-with-comment',
        question: 'Насколько вам комфортно находиться наедине с собой?',
        required: true,
      },
      {
        id: 'physical-health-rating',
        order: 10,
        type: 'scale-with-comment',
        question: 'Как вы оцениваете своё физическое самочувствие в повседневной жизни?',
        required: true,
      },
      {
        id: 'emotional-wellbeing',
        order: 11,
        type: 'scale-with-comment',
        question: 'Как вы оцениваете своё эмоциональное состояние в последнее время?',
        required: true,
      },
      {
        id: 'leisure-hobbies',
        order: 12,
        type: 'scale-with-comment',
        question: 'Есть ли в вашей жизни занятия, которые приносят вам удовольствие и отдых?',
        required: true,
      },
      {
        id: 'living-conditions',
        order: 13,
        type: 'scale-with-comment',
        question: 'Насколько вы довольны своими жилищными условиями?',
        required: true,
      },
      {
        id: 'financial-status',
        order: 14,
        type: 'scale-with-comment',
        question: 'Как вы оцениваете стабильность своего финансового положения?',
        required: true,
      },
    ],
  },
  {
    id: 'communication-style',
    title: 'ВЫБОР СТИЛЯ ОБЩЕНИЯ ДЭЙЗИ',
    questions: [
      {
        id: 'communication-style',
        order: 15,
        type: 'style-selection',
        question: 'Как бы вы хотели, чтобы Дэйзи с вами общалась?',
        required: true,
      },
    ],
  },
]

export async function GET() {
  try {
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { message: apiMessages.internalServerError },
      { status: 500 }
    );
  }
}
