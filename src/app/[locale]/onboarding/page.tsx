'use client'

import { useState, useEffect, FormEvent, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { ClientOnly } from '@/shared/components/ClientOnly'
import { ConsentGate } from '@/shared/components/ConsentGate'
import { useAuth } from '@/shared/hooks/useAuth'
import { OnboardingApiService } from '@/shared/services/onboarding'
import { OnboardingAnswer, OnboardingAnswerValue } from '@/shared/types/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  ONBOARDING_STEPS,
  SECTION_LABEL_KEYS,
  QUESTION_SCALE_GROUP,
  SCALE_ICONS,
  COMMUNICATION_STYLE_IDS,
  type OnboardingStep,
} from './steps'
import { isOnboardingSingleChoiceStep, isOptionalQuestionStep } from './navigation'

// ─── Step renderer ───────────────────────────────────────────────────────────

function StepContent({
  step,
  answers,
  onChange,
  onNext,
  autoAdvance,
  t,
  tSettings,
}: {
  step: OnboardingStep
  answers: Record<string, OnboardingAnswerValue>
  onChange: (id: string, value: OnboardingAnswerValue) => void
  onNext: (force?: boolean) => void
  autoAdvance: boolean
  t: ReturnType<typeof useTranslations>
  tSettings: ReturnType<typeof useTranslations>
}) {
  const scaleLabelsFor = (questionId: string): string[] => {
    const group = QUESTION_SCALE_GROUP[questionId] ?? 'default'
    const raw = t.raw(`flow.scale.${group}`)
    return Array.isArray(raw) ? (raw as string[]) : []
  }

  const handleScale = (value: number) => {
    onChange(step.questionId!, value)
    if (autoAdvance) setTimeout(() => onNext(true), 300)
  }

  const handleMultiselect = (optKey: string) => {
    const current = (answers[step.questionId!] as string[] | null) ?? []
    const next = current.includes(optKey) ? current.filter((s) => s !== optKey) : current.length < (step.maxSelect ?? 2) ? [...current, optKey] : current
    onChange(step.questionId!, next)
  }

  const handleStyleSelect = (id: string) => {
    const current = (answers[step.questionId!] as string[] | null) ?? []
    const next = current.includes(id) ? current.filter((s) => s !== id) : current.length < (step.maxSelect ?? 2) ? [...current, id] : current
    onChange(step.questionId!, next)
  }

  const handleRelationship = (value: 'yes' | 'no' | 'unsure') => {
    onChange(step.questionId!, { value, rel_quality: value === 'yes' ? undefined : undefined, other: value === 'unsure' ? '' : undefined })
    if (autoAdvance && value === 'no') setTimeout(() => onNext(true), 300)
  }

  const handleRelQuality = (rating: number) => {
    const current = answers[step.questionId!] as { value: string; rel_quality?: number; other?: string } | null
    onChange(step.questionId!, { ...current, value: 'yes', rel_quality: rating })
    if (autoAdvance) setTimeout(() => onNext(true), 300)
  }

  const handleYesNoText = (value: 'yes' | 'no') => {
    const current = answers[step.questionId!] as { value?: string; text?: string } | null
    onChange(step.questionId!, { ...current, value, text: value === 'yes' ? (current?.text ?? '') : undefined })
    if (autoAdvance && value === 'no') setTimeout(() => onNext(true), 300)
  }

  if (step.type === 'welcome' || step.type === 'transition') {
    return (
      <div className="space-y-8">
        <p className="text-lg sm:text-xl text-foreground whitespace-pre-line leading-relaxed">{step.contentKey ? t(step.contentKey) : ''}</p>
      </div>
    )
  }

  if (step.type === 'final') {
    return null
  }

  if (step.type === 'question') {
    if (step.questionType === 'scale') {
      const labels = scaleLabelsFor(step.questionId!)
      const rating = (answers[step.questionId!] as number) ?? 0
      return (
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleScale(v)}
              className={`flex flex-col items-center justify-center gap-2 w-28 min-h-[6rem] p-3 rounded-2xl border-2 transition-all ${
                rating === v ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40 hover:bg-muted/50'
              }`}
            >
              <Image src={SCALE_ICONS[v - 1]} alt="" width={48} height={48} className="shrink-0" />
              <span className="text-[11px] text-center text-foreground/80 leading-tight">{labels[v - 1] ?? ''}</span>
            </button>
          ))}
        </div>
      )
    }

    if (step.questionType === 'multiselect') {
      const selected = (answers[step.questionId!] as string[] | null) ?? []
      const otherText = (answers[`${step.questionId!}_other`] as string) ?? ''
      const keys = step.optionKeys ?? []
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {keys.map((optKey) => {
              const isSelected = selected.includes(optKey)
              const isDisabled = !isSelected && selected.length >= (step.maxSelect ?? 2)
              const label = t(`flow.supportNeeds.options.${optKey}`)
              return (
                <button
                  key={optKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleMultiselect(optKey)}
                  className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-medium transition-all ${
                    isSelected ? 'border-primary bg-primary/10' : isDisabled ? 'opacity-40 cursor-not-allowed border-[hsl(var(--app-border))]' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <div className="pt-2">
            <label className="block text-sm text-muted-foreground mb-1">{t('flow.supportNeeds.otherLabel')}</label>
            <Input
              value={otherText}
              onChange={(e) => onChange(`${step.questionId!}_other`, e.target.value)}
              placeholder={t('flow.supportNeeds.otherPlaceholder')}
              className="rounded-2xl border-2"
            />
          </div>
        </div>
      )
    }

    if (step.questionType === 'style-selection') {
      const selected = (answers[step.questionId!] as string[] | null) ?? []
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMUNICATION_STYLE_IDS.map((styleId) => {
            const isSelected = selected.includes(styleId)
            const isDisabled = !isSelected && selected.length >= (step.maxSelect ?? 2)
            const tooltip = tSettings(`communicationStyles.${styleId}.tooltip`)
            return (
              <button
                key={styleId}
                type="button"
                disabled={isDisabled}
                onClick={() => handleStyleSelect(styleId)}
                title={tooltip}
                className={`text-left p-4 rounded-2xl border-2 transition-all group ${
                  isSelected ? 'border-primary bg-primary/10' : isDisabled ? 'opacity-40 cursor-not-allowed border-[hsl(var(--app-border))]' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
                }`}
              >
                <p className="font-semibold text-foreground mb-1">{tSettings(`communicationStyles.${styleId}.name`)}</p>
                <p className="text-xs text-muted-foreground">{tSettings(`communicationStyles.${styleId}.keywords`)}</p>
                {tooltip && (
                  <p className="text-xs text-muted-foreground/70 mt-2 italic opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2" title={tooltip}>
                    {tooltip}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )
    }

    if (step.questionType === 'relationship') {
      const val = answers[step.questionId!] as { value?: string; rel_quality?: number; other?: string } | null
      const relVal = val?.value
      const relQuality = val?.rel_quality ?? 0
      const otherText = val?.other ?? ''
      const labels = scaleLabelsFor('rel_quality')
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {(['yes', 'no', 'unsure'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleRelationship(v)}
                className={`px-6 py-3 rounded-2xl border-2 font-medium transition-all ${
                  relVal === v ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
                }`}
              >
                {t(`flow.relationship.${v}`)}
              </button>
            ))}
          </div>
          {relVal === 'yes' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t('flow.relationship.qualityPrompt')}</p>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleRelQuality(v)}
                    className={`flex flex-col items-center justify-center gap-2 w-28 min-h-[6rem] p-3 rounded-2xl border-2 transition-all ${
                      relQuality === v ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
                    }`}
                  >
                    <Image src={SCALE_ICONS[v - 1]} alt="" width={48} height={48} className="shrink-0" />
                    <span className="text-[10px] text-center leading-tight">{labels[v - 1] ?? ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {relVal === 'unsure' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('flow.relationship.unsureLabel')}</label>
              <Textarea
                value={otherText}
                onChange={(e) => onChange(step.questionId!, { ...val, value: 'unsure', other: e.target.value })}
                placeholder={t('flow.relationship.unsurePlaceholder')}
                rows={3}
                className="rounded-2xl border-2"
              />
            </div>
          )}
        </div>
      )
    }

    if (step.questionType === 'yes-no-text') {
      const val = answers[step.questionId!] as { value?: string; text?: string } | null
      const ynVal = val?.value
      const textVal = val?.text ?? ''
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {(['yes', 'no'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleYesNoText(v)}
                className={`px-6 py-3 rounded-2xl border-2 font-medium transition-all ${
                  ynVal === v ? 'border-primary bg-primary/10' : 'border-[hsl(var(--app-border))] hover:border-primary/40'
                }`}
              >
                {t(`flow.yesNo.${v}`)}
              </button>
            ))}
          </div>
          {ynVal === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('flow.yesNo.optionalDetail')}</label>
              <Textarea
                value={textVal}
                onChange={(e) => onChange(step.questionId!, { ...val, value: 'yes', text: e.target.value })}
                placeholder={t('flow.yesNo.placeholder')}
                rows={3}
                className="rounded-2xl border-2"
              />
            </div>
          )}
        </div>
      )
    }
  }

  return null
}

// ─── Main ───────────────────────────────────────────────────────────────────

function OnboardingPageContent() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('onboarding')
  const tSettings = useTranslations('settings')
  const { user, isLoading: isAuthLoading } = useAuth()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswerValue>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onboardingService = new OnboardingApiService()

  const steps = ONBOARDING_STEPS
  const currentStep = steps[stepIndex]
  const q = currentStep?.type === 'question' ? (answers[currentStep.questionId!] as { value?: string } | null) : null
  const isSingleChoiceStep = isOnboardingSingleChoiceStep(currentStep, q)
  const isOptionalStep = isOptionalQuestionStep(currentStep)
  const autoAdvance = isSingleChoiceStep

  const progressLabels = useMemo(() => (t.raw('flow.progress') as string[]) ?? [], [t])

  useEffect(() => {
    if (!isAuthLoading && user?.isOnboarded) {
      router.push(`/${locale}/chat`)
    }
  }, [user, isAuthLoading, router, locale])

  const handleAnswerChange = (id: string, value: OnboardingAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    setError(null)
  }

  const nextStep = (force?: boolean) => {
    if (!force && currentStep?.type === 'question' && currentStep.required) {
      const val = answers[currentStep.questionId!]
      if (currentStep.questionType === 'scale' && (val == null || (typeof val === 'number' && (val < 1 || val > 5)))) return
      if (currentStep.questionType === 'multiselect' && (!Array.isArray(val) || val.length === 0)) return
      if (currentStep.questionType === 'style-selection' && (!Array.isArray(val) || val.length === 0)) return
      if (currentStep.questionType === 'relationship') {
        const rel = val as { value?: string; rel_quality?: number } | null
        if (!rel?.value) return
        if (rel.value === 'yes' && (rel.rel_quality == null || rel.rel_quality < 1)) return
      }
      if (currentStep.questionType === 'yes-no-text' && currentStep.required) {
        const yn = val as { value?: string } | null
        if (!yn?.value) return
      }
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1)
      setError(null)
    }
  }

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1)
      setError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const finalAnswers: OnboardingAnswer[] = []
    for (const [id, answer] of Object.entries(answers)) {
      if (id.endsWith('_other')) continue
      if (answer != null && answer !== '') finalAnswers.push({ questionId: id, answer })
    }
    if ((answers.support_needs as string[] | null)?.length) {
      const other = answers.support_needs_other
      if (other && typeof other === 'string' && other.trim()) {
        finalAnswers.push({ questionId: 'support_needs_other', answer: other })
      }
    }

    try {
      if (user) {
        await onboardingService.submitAnswers(finalAnswers)
        const styleAnswer = answers.communication_style
        if (styleAnswer && Array.isArray(styleAnswer) && styleAnswer.length > 0) {
          await fetch('/api/account/style', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ styles: styleAnswer }),
          })
        }
        setSubmitSuccess(true)
        setTimeout(() => router.push(`/${locale}/chat`), 1500)
      } else {
        localStorage.setItem('pending_onboarding', JSON.stringify(finalAnswers))
        router.push(`/${locale}/register`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Onboarding submission error:', { error: err, message: msg })
      setError(t('flow.errors.submitFailed', { details: msg ? ` (${msg})` : '' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50/80 via-[hsl(var(--app-bg))] to-amber-50/50">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-200/50 flex items-center justify-center mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
          </motion.div>
          <p className="text-base font-medium text-foreground/90 mb-3">{t('loading')}</p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-sky-500/70"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[hsl(var(--app-bg))] flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{t('allSet')}</h2>
          <p className="text-muted-foreground">{t('redirecting')}</p>
        </motion.div>
      </div>
    )
  }

  const sectionLabelKey = currentStep ? SECTION_LABEL_KEYS[currentStep.section] : ''
  const sectionLabel = sectionLabelKey ? t(sectionLabelKey) : ''
  const isWelcome = currentStep?.type === 'welcome'
  const isTransition = currentStep?.type === 'transition'
  const isFinal = currentStep?.type === 'final'
  const questionCount = steps.filter((s) => s.type === 'question').length
  const currentQuestionNum = steps.slice(0, stepIndex + 1).filter((s) => s.type === 'question').length
  const progressSectionIndex = currentStep?.section === 'emotional-start' ? 0 : currentStep?.section === 'life-areas' ? 1 : 2

  const welcomeTitle = currentStep?.contentKey ? t(currentStep.contentKey) : ''
  const transitionTitle = currentStep?.contentKey ? t(currentStep.contentKey) : ''
  const finalTitle = currentStep?.contentKey ? t(currentStep.contentKey) : ''

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--app-bg))]">
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1.5">
            {progressLabels.map((label, i) => (
              <span key={i} className={i === progressSectionIndex ? 'font-semibold text-foreground' : ''}>
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((progressSectionIndex + 1) / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[hsl(var(--app-border))] shadow-sm p-1.5">
              <Image src="/images/daisy-icon.svg" alt="Daisy" width={40} height={40} className="object-contain" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">DAISY</span>
          </Link>
          <div className="flex-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sectionLabel}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <form onSubmit={handleSubmit} id="onboarding-form">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {isWelcome && (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight whitespace-pre-line">{welcomeTitle}</h1>
                    <div className="pt-4">
                      <p className="text-xs text-muted-foreground">
                        {t('flow.legal.prefix')}{' '}
                        <Link href={`/${locale}/terms`} className="underline hover:text-foreground">
                          {t('flow.legal.termsLink')}
                        </Link>{' '}
                        {t('flow.legal.and')}{' '}
                        <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">
                          {t('flow.legal.privacyLink')}
                        </Link>
                        {t('flow.legal.suffix')}
                      </p>
                    </div>
                  </>
                )}

                {isTransition && <h2 className="text-xl sm:text-2xl font-semibold text-foreground whitespace-pre-line leading-relaxed">{transitionTitle}</h2>}

                {currentStep?.type === 'question' && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t('flow.questionCounter', { current: currentQuestionNum, total: questionCount })}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                      {currentStep.questionKey ? t(currentStep.questionKey) : ''}
                      {currentStep.required && <span className="text-destructive ml-1">*</span>}
                    </h2>
                    <StepContent
                      step={currentStep}
                      answers={answers}
                      onChange={handleAnswerChange}
                      onNext={nextStep}
                      autoAdvance={autoAdvance}
                      t={t}
                      tSettings={tSettings}
                    />
                  </>
                )}

                {isFinal && <h2 className="text-2xl sm:text-3xl font-semibold text-foreground whitespace-pre-line leading-relaxed">{finalTitle}</h2>}

                {error && (
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>

          <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-[hsl(var(--app-border))]">
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl text-muted-foreground hover:text-foreground"
              onClick={prevStep}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {stepIndex + 1} / {steps.length}
            </span>
            {isWelcome || isTransition ? (
              <Button type="button" className="rounded-2xl" onClick={() => nextStep()}>
                {currentStep?.buttonKey ? t(currentStep.buttonKey) : t('next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : isFinal ? (
              <Button type="submit" form="onboarding-form" className="rounded-2xl" disabled={isSubmitting}>
                {isSubmitting ? t('submitting') : currentStep?.buttonKey ? t(currentStep.buttonKey) : t('complete')}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : isOptionalStep ? (
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" className="rounded-2xl text-muted-foreground" onClick={() => nextStep()}>
                  {t('flow.skip')}
                </Button>
                <Button type="button" className="rounded-2xl" onClick={() => nextStep()}>
                  {t('next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : isSingleChoiceStep ? (
              <div className="w-24" aria-hidden />
            ) : (
              <Button type="button" className="rounded-2xl" onClick={() => nextStep()}>
                {t('next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <ClientOnly>
      <ConsentGate>
        <OnboardingPageContent />
      </ConsentGate>
    </ClientOnly>
  )
}
