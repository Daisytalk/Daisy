'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type MetricsPayload = {
  updatedAt: string
  totalUsers: number
  usersStartedChat: number
  totalUserMessages: number
  payingUsersCount: number
  paymentsTransactionsCount: number
  totalsByCurrency: { currency: string; amountMinor: number }[]
  bySource: { sourceKey: string; label: string; users: number }[]
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

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const r = await fetch('/api/admin/metrics', { credentials: 'include', cache: 'no-store' })
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
  }, [locale])

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
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Метрики Daisy</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Обновлено: {metrics ? new Date(metrics.updatedAt).toLocaleString('ru-RU') : '—'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refresh()} disabled={busy}>
              Обновить
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => logout()} disabled={busy}>
              Выйти из админки
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Всего пользователей" value={metrics?.totalUsers ?? 0} hint="Зарегистрировано в базе" />
          <MetricCard
            title="Начали чат"
            value={metrics?.usersStartedChat ?? 0}
            hint="Есть хотя бы одна CBT-сессия"
          />
          <MetricCard
            title="Сообщений от пользователей"
            value={metrics?.totalUserMessages ?? 0}
            hint="Роль «user» в CBT-сообщениях"
          />
          <MetricCard
            title="Заплатили (пользователей)"
            value={metrics?.payingUsersCount ?? 0}
            hint="Есть хотя бы одна запись об оплате"
          />
          <MetricCard
            title="Платежей (транзакций)"
            value={metrics?.paymentsTransactionsCount ?? 0}
            hint="Всего записей в таблице платежей"
          />
          <RevenueCard totals={metrics?.totalsByCurrency ?? []} />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/40">
            <h2 className="font-medium">Откуда пришли</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              По полю источника при первом заходе (UTM / referrer). Старые аккаунты — «Не указано».
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-semibold tabular-nums mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-2">{hint}</p>
    </div>
  )
}

function RevenueCard({ totals }: { totals: { currency: string; amountMinor: number }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">Выручка (сумма)</p>
      {totals.length === 0 ? (
        <>
          <p className="text-3xl font-semibold tabular-nums mt-1">—</p>
          <p className="text-xs text-muted-foreground mt-2">Нет сохранённых платежей</p>
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
        Суммы в минорных единицах валюты (например центы USD). Несколько валют — отдельные строки.
      </p>
    </div>
  )
}
