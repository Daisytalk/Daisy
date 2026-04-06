'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const SECTION_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17'] as const

export function PrivacyToc() {
  const t = useTranslations('privacy')
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

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-24 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{t('toc.title')}</p>
        {SECTION_IDS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className={`block py-1.5 px-3 rounded-lg text-sm transition-colors ${
              activeId === id
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {t(`toc.${id}`)}
          </a>
        ))}
      </div>
    </nav>
  )
}
