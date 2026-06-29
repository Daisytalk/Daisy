'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const SECTION_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17'] as const

const SCROLL_OFFSET = 120

function resolveActiveSection(sections: HTMLElement[]): string | null {
  if (sections.length === 0) return null

  let active = sections[0].id
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= SCROLL_OFFSET) {
      active = section.id
    } else {
      break
    }
  }
  return active
}

export function PrivacyToc() {
  const t = useTranslations('privacy')
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (sections.length === 0) return

    let frame = 0

    const updateActiveSection = () => {
      frame = 0
      const nextId = resolveActiveSection(sections)
      setActiveId((prev) => (prev === nextId ? prev : nextId))
    }

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateActiveSection)
      }
    }

    updateActiveSection()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
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
