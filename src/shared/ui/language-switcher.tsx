'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'

type Locale = 'en' | 'ru' | 'kz'

const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  kz: { name: 'Қазақша', flag: '🇰🇿' }
}

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>('en')
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedLocale = (localStorage.getItem('locale') as Locale) || 'en'
      setLocale(savedLocale)
      setIsInitialized(true)

      const handleLocaleChange = (event: CustomEvent) => {
        setLocale(event.detail)
      }

      window.addEventListener('localeChange', handleLocaleChange as EventListener)
      return () => window.removeEventListener('localeChange', handleLocaleChange as EventListener)
    }
  }, [isInitialized])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
      window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }))
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-white hover:text-gray-300 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{languages[locale].flag}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => changeLocale(code as Locale)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                locale === code ? 'bg-gray-50 text-emerald-600' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}