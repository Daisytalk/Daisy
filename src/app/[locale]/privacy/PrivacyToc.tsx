'use client'

import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 's1', label: 'Термины и определения' },
  { id: 's2', label: 'Важное предупреждение' },
  { id: 's3', label: 'Согласие на обработку данных' },
  { id: 's4', label: 'Общие положения' },
  { id: 's5', label: 'Состав данных' },
  { id: 's6', label: 'Цели обработки' },
  { id: 's7', label: 'AI-ассистент' },
  { id: 's8', label: 'Сроки обработки' },
  { id: 's9', label: 'Передача данных' },
  { id: 's10', label: 'Обучение AI' },
  { id: 's11', label: 'Меры защиты' },
  { id: 's12', label: 'Права субъекта' },
  { id: 's13', label: 'Возрастные ограничения' },
  { id: 's14', label: 'Обязательства сторон' },
  { id: 's15', label: 'Ответственность' },
  { id: 's16', label: 'Разрешение споров' },
  { id: 's17', label: 'Заключительные положения' },
]

export function PrivacyToc() {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-24 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Содержание
        </p>
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`block py-1.5 px-3 rounded-lg text-sm transition-colors ${
              activeId === id
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
