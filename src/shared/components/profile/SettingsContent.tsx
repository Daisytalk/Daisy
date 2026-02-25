'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Download,
  Trash2,
  Brain,
  AlertTriangle,
  Pencil,
  Check,
  MessageCircle,
  Settings,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import { AuthApiService } from '@/shared/services/auth'
import type { OnboardingData, OnboardingQuestion } from '@/shared/types/auth'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AppLayout } from '@/shared/components/AppLayout'

const COMMUNICATION_STYLES = [
  { id: 'warm_friend', name: 'Тёплая подруга', keywords: 'душевная, понимающая, мягкая' },
  { id: 'practical_helper', name: 'Практичный помощник', keywords: 'конкретный, структурированный, честный' },
  { id: 'gentle_explorer', name: 'Мягкий исследователь', keywords: 'любопытный, рефлексивный, глубокий' },
  { id: 'calm_mentor', name: 'Спокойный наставник', keywords: 'уравновешенный, принимающий, терпеливый' },
  { id: 'wise_teacher', name: 'Мудрый учитель', keywords: 'информативный, научный, обучающий' },
  { id: 'flexible_companion', name: 'Гибкая собеседница', keywords: 'чуткий, ситуативный, настраиваемый' },
]

function formatAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return '-'
  if (Array.isArray(answer)) return answer.join(', ')
  if (typeof answer === 'boolean') return answer ? 'Да' : 'Нет'
  if (typeof answer === 'number') return `Оценка: ${answer}/5`
  if (typeof answer === 'object') {
    const o = answer as Record<string, unknown>
    if (typeof o.rating === 'number') return `Оценка: ${o.rating}/5${o.comment ? ` - ${o.comment}` : ''}`
    if (o.value === 'yes') return typeof o.rel_quality === 'number' ? `Да, оценка: ${o.rel_quality}/5` : 'Да'
    if (o.value === 'no') return 'Нет'
    if (o.value === 'unsure') return o.other ? `Сложно сказать: ${o.other}` : 'Сложно сказать'
    if (o.yes === true) return o.detail ? `Да - ${o.detail}` : 'Да'
    if (o.yes === false) return 'Нет'
    if (o.hasRelationship === false) return 'Нет отношений'
    if (o.hasRelationship === true) return typeof o.rating === 'number' ? `Оценка: ${o.rating}/5` : 'Да'
    return JSON.stringify(answer)
  }
  return String(answer)
}

export function SettingsContent() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accountAction, setAccountAction] = useState<'idle' | 'exporting' | 'clearing' | 'deleting'>('idle')
  const [accountError, setAccountError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [isEditingStyle, setIsEditingStyle] = useState(false)
  const [draftStyles, setDraftStyles] = useState<string[]>([])
  const [styleSaving, setStyleSaving] = useState(false)

  const { user, logout } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const onboardingService = useMemo(() => new OnboardingApiService(), [])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [data, sections, styleRes] = await Promise.all([
        onboardingService.getOnboardingData(user.id),
        onboardingService.getQuestions(),
        fetch('/api/account/style', {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        }).then((r) => (r.ok ? r.json() : { styles: [] })),
      ])
      setOnboardingData(data)
      setQuestions(sections.flatMap((s) => s.questions))
      const styles = styleRes?.styles ?? []
      setSelectedStyles(Array.isArray(styles) ? styles : [])
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, onboardingService])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const QUESTION_LABELS: Record<string, string> = {
    mood_today: 'Как ты себя чувствуешь сегодня?',
    support_needs: 'Где тебе нужна поддержка?',
    work_state: 'Работа / учёба',
    relationships: 'Отношения',
    family_support: 'Поддержка близких',
    solo_comfort: 'Комфорт наедине с собой',
    physical_state: 'Физическое самочувствие',
    emo_state: 'Эмоциональное состояние',
  }

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 14

  const startEditingStyle = () => {
    setDraftStyles([...selectedStyles])
    setIsEditingStyle(true)
  }

  const toggleDraftStyle = (id: string) => {
    if (draftStyles.includes(id)) setDraftStyles(draftStyles.filter((s) => s !== id))
    else if (draftStyles.length < 2) setDraftStyles([...draftStyles, id])
  }

  const saveStyle = async () => {
    setStyleSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/account/style', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ styles: draftStyles }),
      })
      if (res.ok) {
        setSelectedStyles(draftStyles)
        setIsEditingStyle(false)
      }
    } catch (err) {
      console.error('Failed to save style', err)
    } finally {
      setStyleSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-12 h-12 border-2 border-[#5ba3c6] border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-[#4a4a4a]">Загрузка настроек...</p>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-[16px] bg-[#e0f7fa] flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#5ba3c6]" />
          </div>
          <h1 className="text-[22px] font-semibold text-[#2d2d2d]">Настройки</h1>
        </div>

        <section>
          <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">Аккаунт</h2>
          <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-[#f0f0f0]">
            <div className="flex items-center gap-5 px-6 py-5">
              <UserIcon className="w-5 h-5 text-[#8e8e8e] shrink-0" />
              <div>
                <p className="text-[13px] text-[#8e8e8e] mb-1">Имя</p>
                <p className="font-medium text-[16px] text-[#2d2d2d]">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 px-6 py-5">
              <Mail className="w-5 h-5 text-[#8e8e8e] shrink-0" />
              <div>
                <p className="text-[13px] text-[#8e8e8e] mb-1">Эл. почта</p>
                <p className="font-medium text-[16px] text-[#2d2d2d]">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 px-6 py-5">
              <Shield className="w-5 h-5 text-[#8e8e8e] shrink-0" />
              <div>
                <p className="text-[13px] text-[#8e8e8e] mb-1">Подписка</p>
                <p className="font-medium text-[16px] text-[#2d2d2d]">
                  {user?.subscriptionStatus === 'trial' ? 'Пробный период' : 'Премиум'}
                </p>
              </div>
            </div>
            {user?.subscriptionStatus === 'trial' && (
              <div className="flex items-center gap-5 px-6 py-5">
                <Calendar className="w-5 h-5 text-[#8e8e8e] shrink-0" />
                <div>
                  <p className="text-[13px] text-[#8e8e8e] mb-1">Пробный период</p>
                  <p className="font-medium text-[16px] text-[#2d2d2d]">
                    {trialDaysLeft > 0 ? `Осталось ${trialDaysLeft} дн.` : 'Истёк'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest">
              Стиль общения с Daisy
            </h2>
            {!isEditingStyle && (
              <button
                onClick={startEditingStyle}
                className="flex items-center gap-2 text-[14px] font-medium text-[#5ba3c6] hover:text-[#4a8fb3]"
              >
                <Pencil className="w-4 h-4" />
                Изменить
              </button>
            )}
          </div>
          {isEditingStyle ? (
            <div className="space-y-4">
              <p className="text-[15px] text-[#6b6b6b] ml-2">Выберите 1-2 стиля</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMMUNICATION_STYLES.map((style) => {
                  const isSelected = draftStyles.includes(style.id)
                  const isDisabled = !isSelected && draftStyles.length >= 2
                  return (
                    <button
                      key={style.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleDraftStyle(style.id)}
                      className={`text-left p-5 rounded-[20px] border-2 transition-all ${
                        isSelected
                          ? 'border-[#5ba3c6] bg-[#e0f7fa] shadow-sm'
                          : isDisabled
                            ? 'border-transparent bg-white opacity-50 cursor-not-allowed'
                            : 'border-transparent bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-[#5ba3c6]/40'
                      }`}
                    >
                      <p className="font-semibold text-[15px] text-[#2d2d2d]">{style.name}</p>
                      <p className="text-[13px] text-[#6b6b6b] mt-1.5 leading-relaxed">{style.keywords}</p>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveStyle}
                  disabled={styleSaving || draftStyles.length === 0}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#5ba3c6] text-white text-[15px] font-medium hover:bg-[#4a8fb3] disabled:opacity-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {styleSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => setIsEditingStyle(false)}
                  className="h-12 px-6 rounded-full bg-white border border-[#e5e5e5] text-[15px] font-medium text-[#4a4a4a] hover:bg-[#f5f5f5] transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : selectedStyles.length > 0 ? (
            <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-[#f0f0f0]">
              {selectedStyles.map((styleId) => {
                const style = COMMUNICATION_STYLES.find((s) => s.id === styleId)
                if (!style) return null
                return (
                  <div key={styleId} className="flex items-center gap-5 px-6 py-5">
                    <div className="w-12 h-12 rounded-[16px] bg-[#e0f7fa] flex items-center justify-center shrink-0">
                      <MessageCircle className="w-6 h-6 text-[#5ba3c6]" />
                    </div>
                    <div>
                      <p className="font-medium text-[16px] text-[#2d2d2d]">{style.name}</p>
                      <p className="text-[14px] text-[#6b6b6b] mt-1">{style.keywords}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
              <p className="text-[15px] text-[#6b6b6b] mb-4">Стиль не выбран</p>
              <button
                onClick={startEditingStyle}
                className="text-[15px] font-medium text-[#5ba3c6] hover:text-[#4a8fb3] underline underline-offset-4 decoration-[#5ba3c6]/40 hover:decoration-[#4a8fb3]"
              >
                Выбрать стиль
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
            Ответы онбординга
          </h2>
          {onboardingData?.answers && onboardingData.answers.length > 0 ? (
            <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-[#f0f0f0]">
              {onboardingData.answers
                .filter((a) => a.questionId !== 'communication_style' && !a.questionId.endsWith('_other'))
                .map((answer, index) => (
                  <div key={index} className="px-6 py-5">
                    <p className="text-[13px] text-[#8e8e8e] mb-2">
                      {QUESTION_LABELS[answer.questionId] ?? answer.questionId}
                    </p>
                    <p className="text-[16px] text-[#2d2d2d] leading-relaxed">{formatAnswer(answer.answer)}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
              <p className="text-[15px] text-[#6b6b6b] mb-6">Онбординг не пройден</p>
              <button
                onClick={() => router.push(`/${locale}/onboarding`)}
                className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#e0f7fa] text-[#5ba3c6] font-medium hover:bg-[#b2ebf2] text-[15px] transition-colors"
              >
                Пройти онбординг
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-[13px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-4 ml-2">
            Данные и приватность
          </h2>
          <div className="rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {accountError && (
              <div className="flex items-center gap-3 p-5 bg-red-50 text-red-600 border-b border-red-100">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-[14px] font-medium">{accountError}</p>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-[#6b6b6b]" />
                </div>
                <div>
                  <p className="font-medium text-[16px] text-[#2d2d2d]">Экспорт данных</p>
                  <p className="text-[13px] text-[#8e8e8e] mt-0.5">Скачать все свои данные (GDPR)</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setAccountError(null)
                  setAccountAction('exporting')
                  try {
                    const authService = new AuthApiService()
                    const data = await authService.exportAccountData()
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `daisy-export-${new Date().toISOString().slice(0, 10)}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  } catch (e) {
                    setAccountError(e instanceof Error ? e.message : 'Ошибка экспорта')
                  } finally {
                    setAccountAction('idle')
                  }
                }}
                disabled={accountAction !== 'idle'}
                className="h-10 px-5 rounded-full text-[14px] font-medium bg-[#f5f5f5] text-[#4a4a4a] hover:bg-[#ebebeb] disabled:opacity-50 transition-colors"
              >
                {accountAction === 'exporting' ? 'Скачивание...' : 'Скачать'}
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-amber-50 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-[16px] text-[#2d2d2d]">Очистить память</p>
                  <p className="text-[13px] text-[#8e8e8e] mt-0.5">Удалить накопленные факты о тебе</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setAccountError(null)
                  setAccountAction('clearing')
                  try {
                    const authService = new AuthApiService()
                    await authService.clearMemory()
                  } catch (e) {
                    setAccountError(e instanceof Error ? e.message : 'Ошибка')
                  } finally {
                    setAccountAction('idle')
                  }
                }}
                disabled={accountAction !== 'idle'}
                className="h-10 px-5 rounded-full text-[14px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {accountAction === 'clearing' ? 'Очистка...' : 'Очистить'}
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-[16px] text-[#2d2d2d]">Деактивировать аккаунт</p>
                  <p className="text-[13px] text-[#8e8e8e] mt-0.5">Аккаунт будет деактивирован на 30 дней</p>
                </div>
              </div>
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setAccountError(null)
                      setAccountAction('deleting')
                      try {
                        const authService = new AuthApiService()
                        await authService.deleteAccount()
                        localStorage.removeItem('auth_token')
                        localStorage.removeItem('user')
                        await logout()
                        window.location.href = `/${locale}`
                      } catch (e) {
                        setAccountError(e instanceof Error ? e.message : 'Ошибка удаления')
                      } finally {
                        setAccountAction('idle')
                        setShowDeleteConfirm(false)
                      }
                    }}
                    disabled={accountAction !== 'idle'}
                    className="h-10 px-5 rounded-full text-[14px] font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {accountAction === 'deleting' ? 'Удаление...' : 'Подтвердить'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={accountAction !== 'idle'}
                    className="h-10 px-5 rounded-full text-[14px] font-medium bg-[#f5f5f5] text-[#4a4a4a] hover:bg-[#ebebeb] disabled:opacity-50 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-10 px-5 rounded-full text-[14px] font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  )
}
