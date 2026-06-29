"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: ReactNode
    requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const locale = useLocale()

    useEffect(() => {
        // Only run on client side
        if (typeof window !== 'undefined' && !isLoading) {
            if (!user) {
                router.push(`/${locale}/login`)
                return
            }

            if (requireOnboarding && !user.isOnboarded) {
                router.push(`/${locale}/onboarding`)
                return
            }
        }
    }, [user, isLoading, router, requireOnboarding, locale])

    // Block UI only on the initial auth load (no user yet). Background refresh on
    // tab focus must not unmount children or in-flight chat streams.
    if (typeof window === 'undefined' || (isLoading && !user)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (requireOnboarding && !user.isOnboarded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}