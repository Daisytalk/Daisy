'use client'

import type { AcquisitionPayload } from '@/shared/lib/attribution'

export const ATTRIBUTION_STORAGE_KEY = 'daisy_acquisition_v1'
export const ATTRIBUTION_COOKIE = 'daisy_attr'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function readUrlAttribution(): Partial<AcquisitionPayload> | null {
  if (typeof window === 'undefined') return null
  const sp = new URLSearchParams(window.location.search)
  const utm_source = sp.get('utm_source')
  const utm_medium = sp.get('utm_medium')
  const utm_campaign = sp.get('utm_campaign')
  const ref = typeof document !== 'undefined' ? document.referrer || '' : ''
  if (utm_source || utm_medium || utm_campaign) {
    return {
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      referrer: ref || undefined,
    }
  }
  if (ref) {
    return { referrer: ref }
  }
  return null
}

function syncCookie(payload: AcquisitionPayload) {
  if (typeof document === 'undefined') return
  try {
    const enc = encodeURIComponent(JSON.stringify(payload))
    document.cookie = `${ATTRIBUTION_COOKIE}=${enc}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  } catch {
    // ignore
  }
}

/** Вызывать на клиенте при загрузке приложения: first-touch в localStorage + cookie для OAuth. */
export function captureAttributionIfNeeded(): void {
  if (typeof window === 'undefined') return
  try {
    const existing = localStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (existing) {
      const parsed = JSON.parse(existing) as AcquisitionPayload
      syncCookie(parsed)
      return
    }
    const fromUrl = readUrlAttribution()
    if (!fromUrl) return
    const payload: AcquisitionPayload = {
      utm_source: fromUrl.utm_source ?? null,
      utm_medium: fromUrl.utm_medium ?? null,
      utm_campaign: fromUrl.utm_campaign ?? null,
      referrer: fromUrl.referrer ?? null,
    }
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(payload))
    syncCookie(payload)
  } catch {
    // ignore
  }
}

export function getStoredAttribution(): AcquisitionPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as AcquisitionPayload
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}
