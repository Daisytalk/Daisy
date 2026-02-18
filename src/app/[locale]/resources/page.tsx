import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ locale: string }>
}

const complianceItems = [
  { icon: '🔐', title: 'Сквозное шифрование', desc: 'Шифрование данных в передаче и хранении' },
  { icon: '📁', title: 'Минимизация данных', desc: 'Храним только необходимое' },
  { icon: '🧠', title: 'Ограничители безопасности ИИ', desc: 'Защита от токсичных и опасных ответов' },
  { icon: '👤', title: 'Архитектура Privacy-by-Design', desc: 'Конфиденциальность встроена в архитектуру' },
  { icon: '🧾', title: 'Соответствие GDPR', desc: 'Право на удаление и экспорт данных' },
  { icon: '🚫', title: 'Нет доступа людей к диалогам', desc: 'Диалоги не читаются сотрудниками' },
  { icon: '📊', title: 'Обезличенная аналитика', desc: 'Анализ только в обезличенном виде' },
  { icon: '⏳', title: 'Управление памятью и авто-удаление', desc: 'Пользователь управляет сроком хранения' },
  { icon: '🧩', title: 'Безопасный конвейер дообучения', desc: 'Без утечки пользовательских данных' },
  { icon: '🧑‍⚕️', title: 'Не медицинское устройство', desc: 'Не заменяет клиническую терапию' },
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
    <div className="min-h-screen bg-[hsl(var(--app-bg))]">
      <div className="border-b border-[hsl(var(--app-border))] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Доверие, безопасность и соответствие стандартам
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Daisy обеспечивает защиту ваших данных и соответствует международным стандартам безопасности.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Безопасность и конфиденциальность</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {complianceItems.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-[hsl(var(--app-border))] shadow-[var(--app-shadow)]"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Региональное законодательство</h2>
          <ul className="space-y-3">
            {regionalLaws.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 items-start p-4 rounded-2xl bg-white border border-[hsl(var(--app-border))] text-foreground text-sm"
              >
                <span className="shrink-0">{item.flag}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Стандарты соответствия</h2>
          <div className="flex flex-wrap gap-3">
            {standards.map((s, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-2xl bg-primary/15 text-foreground text-sm font-medium border border-primary/20"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
