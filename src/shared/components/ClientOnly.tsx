'use client'

import { useSyncExternalStore, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

const emptySubscribe = () => () => {}

export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isClient) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}