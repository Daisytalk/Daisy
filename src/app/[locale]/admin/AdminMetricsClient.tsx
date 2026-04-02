'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import type { MetricsPreset } from '@/shared/lib/admin-metrics-period'

type MetricsPayload = {
  period: {
    preset: MetricsPreset
    from: string | null
    to: string
    label: string
  }
  updatedAt: string
  totalUsers: number
  usersStartedChat: number
  totalUserMessages: number
  payingUsersCount: number
  paymentsTransactionsCount: number
  totalsByCurrency: { currency: string; amountMinor: number }[]
  bySource: { sourceKey: string; label: string; users: number }[]
}

const PRESETS: { value: MetricsPreset; label: string }[] = [
  { value: 'all', label: 'Всё время' },
  { value: 'today', label: 'Сегодня' },
  { value: 'yesterday', label: 'Вчера' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'mtd', label: 'Месяц' },
  { value: 'ytd', label: 'Год' },
  { value: 'custom', label: 'Свой' },
]

function defaultCustomRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

function formatMinorAsMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountMinor / 100)
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`
  }
}

export default function AdminMetricsClient() {
  const locale = useLocale()
  const [authState, setAuthState] = useState<'loading' | 'guest' | 'authed'>('loading')
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null)
  const [adminLogin, setAdminLogin] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [preset, setPreset] = useState<MetricsPreset>('mtd')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const buildMetricsUrl = useCallback(() => {
    const p = new URLSearchParams()
    p.set('preset', preset)
    if (preset === 'custom') {
      const d = customFrom && customTo ? { from: customFrom, to: customTo } : defaultCustomRange()
      p.set('from', d.from)
      p.set('to', d.to)
    }
    return `/api/admin/metrics?${p.toString()}`
  }, [preset, customFrom, customTo])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const r = await fetch(buildMetricsUrl(), { credentials: 'include', cache: 'no-store' })
      if (r.ok) {
        setMetrics(await r.json())
        setAuthState('authed')
        return
      }
      const j = await r.json().catch(() => ({}))
      if (r.status === 401 && j.code === 'user_auth') {
        window.location.href = `/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`
        return
      }
      if (r.status === 401 || r.status === 403) {
        setMetrics(null)
        setAuthState('guest')
        return
      }
      setError(typeof j.message === 'string' ? j.message : 'Не удалось загрузить метрики')
      setAuthState('guest')
    } catch {
      setError('Сеть недоступна')
      setAuthState('guest')
    }
  }, [locale, buildMetricsUrl])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ login: adminLogin, password: adminPassword }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.status === 401 && j.code === 'user_auth') {
        window.location.href = `/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`
        return
      }
      if (!r.ok) {
        throw new Error(typeof j.message === 'string' ? j.message : 'Вход не удался')
      }
      setAdminLogin('')
      setAdminPassword('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    setBusy(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
      setMetrics(null)
      setAuthState('guest')
    } finally {
      setBusy(false)
    }
  }

  const isAllTime = metrics?.period.preset === 'all'

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      </div>
    )
  }

  if (authState === 'guest') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-sky-50/80 to-background">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Админка · метрики</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Логин и пароль задаются в переменных окружения ADMIN_LOGIN и ADMIN_PASSWORD (сначала войдите в аккаунт Daisy).
          </p>
          <form onSubmit={login} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-3 py-2">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-login">Логин</Label>
              <Input
                id="admin-login"
                type="text"
                autoComplete="username"
                value={adminLogin}
                onChange={(e) => setAdminLogin(e.target.value)}
                className="h-11 rounded-xl"
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Пароль</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="h-11 rounded-xl"
                disabled={busy}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={busy || !adminLogin.trim() || !adminPassword}
            >
              {busy ? 'Вход…' : 'Войти'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-[hsl(var(--app-bg))] px-4 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Метрики Daisy</h1>
            <p className="text-sm text-muted-foreground">{metrics?.period.label ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Обновлено: {metrics ? new Date(metrics.updatedAt).toLocaleString('ru-RU') : '—'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-2 border-border bg-card shadow-sm"
              onClick={() => refresh()}
              disabled={busy}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => logout()} disabled={busy}>
              Выйти из админки
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-3 shadow-[var(--app-shadow)] backdrop-blur-sm">
          <p className="text-xs font-medium text-muted-foreground px-1 pb-2">Период</p>
          <ToggleGroup
            type="single"
            value={preset}
            onValueChange={(v) => {
              if (!v) return
              const next = v as MetricsPreset
              setPreset(next)
              if (next === 'custom') {
                const d = defaultCustomRange()
                setCustomFrom('')
                setCustomTo('')
              }
            }}
            className="flex flex-wrap justify-start gap-1.5"
          >
            {PRESETS.map(({ value, label }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                aria-label={label}
                variant="outline"
                size="sm"
                className="rounded-full border-2 border-primary/15 data-[state=on]:border-primary/40 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground px-3.5 h-9 text-xs sm:text-sm"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {preset === 'custom' && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="custom-from" className="text-xs text-muted-foreground">
                  С даты
                </Label>
                <Input
                  id="custom-from"
                  type="date"
                  value={customFrom || defaultCustomRange().from}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 w-full sm:w-44 rounded-xl border-2"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-to" className="text-xs text-muted-foreground">
                  По дату
                </Label>
                <Input
                  id="custom-to"
                  type="date"
                  value={customTo || defaultCustomRange().to}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-10 w-full sm:w-44 rounded-xl border-2"
                />
              </div>
              <Button
                type="button"
                className="rounded-xl h-10"
                onClick={() => refresh()}
                disabled={busy}
              >
                Применить
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title={isAllTime ? 'Всего пользователей' : 'Новые регистрации'}
            value={metrics?.totalUsers ?? 0}
            hint={isAllTime ? 'Все учётные записи в базе' : 'Пользователи, зарегистрированные за период'}
          />
          <MetricCard
            title={isAllTime ? 'Начали чат (когда-либо)' : 'Активность в чате'}
            value={metrics?.usersStartedChat ?? 0}
            hint={
              isAllTime
                ? 'Есть хотя бы одна CBT-сессия'
                : 'Уникальные пользователи с новой сессией в периоде'
            }
          />
          <MetricCard
            title="Сообщений от пользователей"
            value={metrics?.totalUserMessages ?? 0}
            hint={isAllTime ? 'Все сообщения с ролью user' : 'За выбранный период'}
          />
          <MetricCard
            title={isAllTime ? 'Платили (когда-либо)' : 'Платили за период'}
            value={metrics?.payingUsersCount ?? 0}
            hint={isAllTime ? 'Есть хотя бы один платёж' : 'Уникальные плательщики за период'}
          />
          <MetricCard
            title="Платежей (транзакций)"
            value={metrics?.paymentsTransactionsCount ?? 0}
            hint={isAllTime ? 'Все записи в таблице платежей' : 'За выбранный период'}
          />
          <RevenueCard totals={metrics?.totalsByCurrency ?? []} isAllTime={isAllTime} />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--app-shadow)]">
          <div className="px-5 py-4 border-b border-border bg-muted/40">
            <h2 className="font-medium">Откуда пришли</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAllTime
                ? 'По источнику при первом заходе (все пользователи).'
                : 'Регистрации за период по источнику при первом заходе.'}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {(metrics?.bySource ?? []).map((row) => (
              <li key={row.sourceKey} className="px-5 py-3 flex justify-between items-center gap-4 text-sm">
                <span>{row.label}</span>
                <span className="tabular-nums font-medium">{row.users}</span>
              </li>
            ))}
            {(!metrics?.bySource || metrics.bySource.length === 0) && (
              <li className="px-5 py-8 text-center text-muted-foreground text-sm">Нет данных</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--app-shadow)]">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-semibold tabular-nums mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{hint}</p>
    </div>
  )
}

function RevenueCard({
  totals,
  isAllTime,
}: {
  totals: { currency: string; amountMinor: number }[]
  isAllTime: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--app-shadow)]">
      <p className="text-sm text-muted-foreground">Выручка (сумма)</p>
      {totals.length === 0 ? (
        <>
          <p className="text-3xl font-semibold tabular-nums mt-1">—</p>
          <p className="text-xs text-muted-foreground mt-2">
            {isAllTime ? 'Нет сохранённых платежей' : 'Нет платежей за период'}
          </p>
        </>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {totals.map((t) => (
            <li key={t.currency} className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{t.currency}</span>
              <span className="font-semibold tabular-nums">{formatMinorAsMoney(t.amountMinor, t.currency)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        {isAllTime
          ? 'Суммы в минорных единицах валюты (например центы USD).'
          : 'Сумма платежей за выбранный период.'}
      </p>
    </div>
  )
}
