'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { User as UserIcon, Mail, Calendar, Shield, MessageCircle, Download, Trash2, Brain, AlertTriangle, Pencil, Check } from 'lucide-react'
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

// ─── Communication style definitions ────────────────────────────────────────

const COMMUNICATION_STYLES = [
  { id: 'warm_friend', name: 'Тёплая подруга', keywords: 'душевная, понимающая, мягкая' },
  { id: 'practical_helper', name: 'Практичный помощник', keywords: 'конкретный, структурированный, честный' },
  { id: 'gentle_explorer', name: 'Мягкий исследователь', keywords: 'любопытный, рефлексивный, глубокий' },
  { id: 'calm_mentor', name: 'Спокойный наставник', keywords: 'уравновешенный, принимающий, терпеливый' },
  { id: 'wise_teacher', name: 'Мудрый учитель', keywords: 'информативный, научный, обучающий' },
  { id: 'flexible_companion', name: 'Гибкая собеседница', keywords: 'чуткий, ситуативный, настраиваемый' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return '—'
  if (Array.isArray(answer)) return answer.join(', ')
  if (typeof answer === 'boolean') return answer ? 'Да' : 'Нет'
  if (typeof answer === 'object') {
    const o = answer as Record<string, unknown>
    // scale
    if (typeof o.rating === 'number') {
      return `Оценка: ${o.rating}/5${o.comment ? ` — ${o.comment}` : ''}`
    }
    // yes-no-conditional-text
    if (o.yes === true) {
      return o.detail ? `Да — ${o.detail}` : 'Да'
    }
    if (o.yes === false) return 'Нет'
    // yes-no-conditional-multiselect
    if (o.hasRelationship === false) return 'Нет отношений'
    if (o.hasRelationship === true) {
      return typeof o.rating === 'number' ? `Оценка: ${o.rating}/5` : 'Да'
    }
    return JSON.stringify(answer)
  }
  return String(answer)
}

// ─── ProfilePageContent ───────────────────────────────────────────────────────

function ProfilePageContent() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accountAction, setAccountAction] = useState<'idle' | 'exporting' | 'clearing' | 'deleting'>('idle')
  const [accountError, setAccountError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // Communication style state
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
        }).then((r) => r.ok ? r.json() : { styles: [] }),
      ])
      setOnboardingData(data)
      setQuestions(sections.flatMap((section) => section.questions))
      const styles = styleRes?.styles ?? []
      setSelectedStyles(Array.isArray(styles) ? styles : [])
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, onboardingService])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const getQuestionText = (questionId: string) =>
    questions.find((q) => q.id === questionId)?.question || questionId

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 14

  const startEditingStyle = () => {
    setDraftStyles([...selectedStyles])
    setIsEditingStyle(true)
  }

  const toggleDraftStyle = (id: string) => {
    if (draftStyles.includes(id)) {
      setDraftStyles(draftStyles.filter((s) => s !== id))
    } else if (draftStyles.length < 2) {
      setDraftStyles([...draftStyles, id])
    }
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
        <div className="h-full flex items-center justify-center bg-[hsl(var(--app-bg))]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Загрузка профиля...</p>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-[hsl(var(--app-bg))]">
        <div className="shrink-0 h-32 sm:h-36 bg-gradient-to-br from-primary to-primary/80" />
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end gap-4 pb-6"
          >
            <div className="w-24 h-24 rounded-full bg-white border-4 border-[hsl(var(--app-bg))] shadow-lg overflow-hidden shrink-0">
              <Image src="/images/user-icon.png" alt={user?.name || 'User'} width={96} height={96} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary">
                  {user?.subscriptionStatus === 'trial' ? `Пробный · ${trialDaysLeft} дн. осталось` : 'Премиум'}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-medium bg-muted text-muted-foreground">
                  {onboardingData?.completedAt ? 'Онбординг пройден' : 'Настройка не завершена'}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8 pb-12">
            {/* Account info */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Аккаунт</h2>
              <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white overflow-hidden divide-y divide-[hsl(var(--app-border))]">
                <div className="flex items-center gap-4 p-4">
                  <UserIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Имя</p>
                    <p className="font-medium text-foreground">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4">
                  <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Эл. почта</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4">
                  <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Подписка</p>
                    <p className="font-medium text-foreground">{user?.subscriptionStatus === 'trial' ? 'Пробный период' : 'Премиум'}</p>
                  </div>
                </div>
                {user?.subscriptionStatus === 'trial' && (
                  <div className="flex items-center gap-4 p-4">
                    <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Пробный период</p>
                      <p className="font-medium text-foreground">{trialDaysLeft > 0 ? `Осталось ${trialDaysLeft} дн.` : 'Истёк'}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Communication style */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Стиль общения с Daisy</h2>
                {!isEditingStyle && (
                  <button
                    onClick={startEditingStyle}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Изменить
                  </button>
                )}
              </div>

              {isEditingStyle ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Выберите 1-2 стиля, которые вам наиболее близки</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COMMUNICATION_STYLES.map((style) => {
                      const isSelected = draftStyles.includes(style.id)
                      const isDisabled = !isSelected && draftStyles.length >= 2
                      return (
                        <button
                          key={style.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggleDraftStyle(style.id)}
                          className={`text-left p-3 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : isDisabled
                                ? 'border-[hsl(var(--app-border))] opacity-40 cursor-not-allowed'
                                : 'border-[hsl(var(--app-border))] hover:border-primary/40 hover:bg-muted/50'
                          }`}
                        >
                          <p className="font-semibold text-sm text-foreground">{style.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{style.keywords}</p>
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveStyle}
                      disabled={styleSaving || draftStyles.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {styleSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      onClick={() => setIsEditingStyle(false)}
                      className="px-4 py-2 rounded-2xl border border-input text-sm hover:bg-muted transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : selectedStyles.length > 0 ? (
                <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white overflow-hidden divide-y divide-[hsl(var(--app-border))]">
                  {selectedStyles.map((styleId) => {
                    const style = COMMUNICATION_STYLES.find((s) => s.id === styleId)
                    if (!style) return null
                    return (
                      <div key={styleId} className="flex items-center gap-3 p-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{style.name}</p>
                          <p className="text-xs text-muted-foreground">{style.keywords}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Стиль общения не выбран</p>
                  <button
                    onClick={startEditingStyle}
                    className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    Выбрать стиль
                  </button>
                </div>
              )}
            </section>

            {/* Daisy card */}
            <section className="rounded-2xl bg-[hsl(160,22%,88%)] p-6 text-foreground relative overflow-hidden border border-[hsl(160,20%,78%)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[hsl(160,20%,70%)] flex items-center justify-center bg-white/95">
                  <Image src="/images/daisy-icon.png" alt="Daisy" width={40} height={40} className="object-contain w-full h-full" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">Твой эмоциональный компаньон</h2>
              </div>
              <p className="text-foreground/80 text-sm mb-2">
                Daisy использует твои ответы онбординга, чтобы адаптировать беседу. Начни чат, когда будешь готов.
              </p>
              <button
                onClick={() => router.push(`/${locale}/chat`)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-[hsl(160,30%,42%)] text-white font-medium hover:bg-[hsl(160,30%,38%)] transition-colors mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                Открыть чат
              </button>
            </section>

            {/* Onboarding answers */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Ответы онбординга</h2>
              {onboardingData?.answers && onboardingData.answers.length > 0 ? (
                <>
                  <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white overflow-hidden divide-y divide-[hsl(var(--app-border))]">
                    {onboardingData.answers.filter((a) => a.questionId !== 'communication-style').map((answer, index) => (
                      <div key={index} className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">{getQuestionText(answer.questionId)}</p>
                        <p className="text-foreground">{formatAnswer(answer.answer)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Эти ответы помогают Daisy адаптировать поддержку под вас.
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white p-6 text-center">
                  <p className="text-muted-foreground text-sm mb-4">Вы ещё не прошли онбординг. Ответьте на вопросы, чтобы Daisy лучше понимала вас.</p>
                  <button
                    onClick={() => router.push(`/${locale}/onboarding`)}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors text-sm"
                  >
                    Пройти онбординг
                  </button>
                </div>
              )}
            </section>

            {/* Data & Privacy */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Данные и приватность</h2>
              <div className="rounded-2xl border border-[hsl(var(--app-border))] bg-white overflow-hidden divide-y divide-[hsl(var(--app-border))]">
                {accountError && (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{accountError}</p>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Экспорт данных</p>
                      <p className="text-xs text-muted-foreground">Скачать все свои данные (GDPR)</p>
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
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                  >
                    {accountAction === 'exporting' ? 'Скачивание...' : 'Скачать'}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Очистить память</p>
                      <p className="text-xs text-muted-foreground">Удалить накопленные факты о тебе</p>
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
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                  >
                    {accountAction === 'clearing' ? 'Очистка...' : 'Очистить'}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Удалить аккаунт</p>
                      <p className="text-xs text-muted-foreground">Безвозвратно удалить все данные</p>
                    </div>
                  </div>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
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
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                      >
                        {accountAction === 'deleting' ? 'Удаление...' : 'Подтвердить'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={accountAction !== 'idle'}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-input hover:bg-muted disabled:opacity-50"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-destructive border border-destructive/50 hover:bg-destructive/10"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <ProfilePageContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
