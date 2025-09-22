'use client'

import { useState, useEffect } from 'react'

type Locale = 'en' | 'ru' | 'kz'

export function useWidgetTranslations(widgetName: string) {
  const [locale, setLocale] = useState<Locale>('en')
  const [translations, setTranslations] = useState<any>({})

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = (localStorage.getItem('locale') as Locale) || 'en'
    setLocale(savedLocale)
    
    // Load translations for the widget
    loadTranslations(widgetName, savedLocale)
  }, [widgetName])

  const loadTranslations = async (widget: string, loc: Locale) => {
    try {
      const translations = await import(`../../widgets/${widget}/locales/${loc}.json`)
      setTranslations(translations.default)
    } catch (error) {
      console.warn(`Failed to load translations for ${widget}/${loc}, falling back to English`)
      try {
        const fallback = await import(`../../widgets/${widget}/locales/en.json`)
        setTranslations(fallback.default)
      } catch (fallbackError) {
        console.error(`Failed to load fallback translations for ${widget}`)
        setTranslations({})
      }
    }
  }

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    loadTranslations(widgetName, newLocale)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }))
  }

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      return key // Return key if translation not found
    }
    
    // Replace parameters in translation
    if (params) {
      return Object.entries(params).reduce((str, [param, replacement]) => {
        return str.replace(new RegExp(`{${param}}`, 'g'), replacement)
      }, value)
    }
    
    return value
  }

  return { t, locale, changeLocale }
}