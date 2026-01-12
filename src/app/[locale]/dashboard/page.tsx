'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export default function DashboardPage() {
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    router.replace(`/${locale}/chat`)
  }, [router, locale])

  return null
}
