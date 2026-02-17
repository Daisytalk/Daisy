import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ locale: string }>
}

const complianceItems = [
  { icon: '🔐', title: 'End-to-End Encryption', desc: 'Шифрование данных в передаче и хранении' },
  { icon: '📁', title: 'Data Minimization Policy', desc: 'Храним только необходимое' },
  { icon: '🧠', title: 'AI Safety Guardrails', desc: 'Защита от токсичных и опасных ответов' },
  { icon: '👤', title: 'Privacy-by-Design Architecture', desc: 'Конфиденциальность встроена в архитектуру' },
  { icon: '🧾', title: 'GDPR-ready', desc: 'Право на удаление и экспорт данных' },
  { icon: '🚫', title: 'No Human Access to Conversations', desc: 'Диалоги не читаются людьми' },
  { icon: '📊', title: 'Anonymized Behavioral Analytics', desc: 'Анализ только в обезличенном виде' },
  { icon: '⏳', title: 'Auto-Delete Memory Controls', desc: 'Пользователь управляет памятью' },
  { icon: '🧩', title: 'Secure Model Fine-Tuning Pipeline', desc: 'Без утечки пользовательских данных' },
  { icon: '🧑‍⚕️', title: 'Not a Medical Device Disclaimer', desc: 'Не заменяет клиническую терапию' },
]

const regionalLaws = [
  { flag: '🇰🇿', text: 'Закон РК «О персональных данных» — защита и хранение данных пользователей Казахстана' },
  { flag: '🇷🇺', text: '152-ФЗ о персональных данных — локализация и обработка персональной информации' },
  { flag: '🇺🇿', text: 'Закон «О персональных данных» (Узбекистан) — согласие и право удаления данных' },
  { flag: '🇰🇬', text: 'Закон КР «Об информации персонального характера» — безопасность пользовательских данных' },
  { flag: '🌍', text: 'Региональная локализация хранения — возможность размещения данных в стране пользователя' },
]

const standards = [
  '🇪🇺 Соответствие GDPR',
  '🛡 SOC 2 Type II Принципы',
  '🧠 Правила безопасности ИИ (OECD/EU AI Act)',
  '🚫 Без передачи третьим лицам',
]

export default async function ResourcesPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Доверие, безопасность и соответствие стандартам
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Daisy обеспечивает защиту ваших данных и соответствует международным стандартам безопасности.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Безопасность и конфиденциальность</h2>
          <div className="space-y-4">
            {complianceItems.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Региональное законодательство</h2>
          <ul className="space-y-3">
            {regionalLaws.map((item, i) => (
              <li key={i} className="flex gap-3 items-start text-gray-700">
                <span>{item.flag}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Стандарты соответствия</h2>
          <div className="flex flex-wrap gap-3">
            {standards.map((s, i) => (
              <span key={i} className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-16 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
