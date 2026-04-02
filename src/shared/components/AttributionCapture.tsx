'use client'

import { useEffect } from 'react'
import { captureAttributionIfNeeded } from '@/shared/lib/attribution-storage'

/** Захват UTM и referrer (first-touch) для метрик «откуда пришёл пользователь». */
export function AttributionCapture() {
  useEffect(() => {
    captureAttributionIfNeeded()
  }, [])
  return null
}
