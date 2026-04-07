/**
 * Серверная нормализация UTM/referrer в источник для аналитики и админки.
 */

export type AcquisitionPayload = {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  referrer?: string | null
}

const SOURCE_PATTERNS: { test: (s: string, ref: string) => boolean; label: string }[] = [
  {
    label: 'instagram',
    test: (s, ref) =>
      /instagram|(^|\b)insta(\b|$)|(^|\b)ig(\b|$)/i.test(s) ||
      /instagram\.com/i.test(ref),
  },
  {
    label: 'vk',
    test: (s, ref) => /(^|\b)vk(\b|$)|vkontakte|vk\.com/i.test(s) || /vk\.com/i.test(ref),
  },
  {
    label: 'telegram',
    test: (s, ref) => /t\.me|telegram/i.test(s) || /t\.me|telegram\.org/i.test(ref),
  },
  {
    label: 'facebook',
    test: (s, ref) =>
      /facebook|fb\.com|(^|\b)fb(\b|$)/i.test(s) || /facebook\.com|fb\.com/i.test(ref),
  },
  {
    label: 'youtube',
    test: (s, ref) => /youtube|youtu\.be/i.test(s) || /youtube\.com|youtu\.be/i.test(ref),
  },
  {
    label: 'tiktok',
    test: (s, ref) => /tiktok/i.test(s) || /tiktok\.com/i.test(ref),
  },
  {
    label: 'twitter',
    test: (s, ref) => /twitter|^x\.com$/i.test(s) || /twitter\.com|x\.com/i.test(ref),
  },
  {
    label: 'linkedin',
    test: (s, ref) => /linkedin/i.test(s) || /linkedin\.com/i.test(ref),
  },
  {
    label: 'ok',
    test: (s, ref) => /(^|\b)ok(\b|$)|odnoklassniki/i.test(s) || /ok\.ru/i.test(ref),
  },
]

function trimDetail(s: string | null | undefined, max = 500): string | null {
  if (!s) return null
  const t = s.trim()
  if (!t) return null
  return t.length > max ? t.slice(0, max) : t
}

export function normalizeAcquisition(input: AcquisitionPayload): {
  source: string
  detail: string | null
} {
  const rawSource = (input.utm_source ?? '').trim().toLowerCase()
  const ref = (input.referrer ?? '').trim()
  const refLower = ref.toLowerCase()

  for (const { test, label } of SOURCE_PATTERNS) {
    if (test(rawSource, refLower)) {
      const detail =
        trimDetail(input.utm_medium) ||
        trimDetail(input.utm_campaign) ||
        trimDetail(ref) ||
        null
      return { source: label, detail }
    }
  }

  if (rawSource) {
    const detail =
      trimDetail(input.utm_medium) ||
      trimDetail(input.utm_campaign) ||
      trimDetail(ref) ||
      null
    return { source: rawSource.slice(0, 64), detail }
  }

  if (ref) {
    return { source: 'referral', detail: trimDetail(ref) }
  }

  return { source: 'direct', detail: null }
}

/** Слияние тела запроса и cookie `daisy_attr`; если данных нет — null (поля User не трогаем). */
export function resolveAcquisitionFromRequest(
  acquisition: AcquisitionPayload | undefined,
  cookieValue: string | null | undefined
): { source: string; detail: string | null } | null {
  const fromCookie = parseAcquisitionCookie(cookieValue ?? null)
  const merged: AcquisitionPayload = {
    utm_source: acquisition?.utm_source ?? fromCookie?.utm_source ?? null,
    utm_medium: acquisition?.utm_medium ?? fromCookie?.utm_medium ?? null,
    utm_campaign: acquisition?.utm_campaign ?? fromCookie?.utm_campaign ?? null,
    referrer: acquisition?.referrer ?? fromCookie?.referrer ?? null,
  }
  const any =
    !!(merged.utm_source || merged.utm_medium || merged.utm_campaign || merged.referrer)
  if (!any) return null
  return normalizeAcquisition(merged)
}

export function parseAcquisitionCookie(raw: string | null | undefined): AcquisitionPayload | null {
  if (!raw?.trim()) return null
  try {
    const decoded = decodeURIComponent(raw)
    const data = JSON.parse(decoded) as unknown
    if (!data || typeof data !== 'object') return null
    const o = data as Record<string, unknown>
    return {
      utm_source: typeof o.utm_source === 'string' ? o.utm_source : null,
      utm_medium: typeof o.utm_medium === 'string' ? o.utm_medium : null,
      utm_campaign: typeof o.utm_campaign === 'string' ? o.utm_campaign : null,
      referrer: typeof o.referrer === 'string' ? o.referrer : null,
    }
  } catch {
    return null
  }
}
