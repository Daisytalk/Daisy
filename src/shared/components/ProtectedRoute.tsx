"use client"
import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: ReactNode
    requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Only run on client side
        if (typeof window !== 'undefined' && !isLoading) {
            if (!user) {
                router.push('/login')
                return
            }

            if (requireOnboarding && !user.isOnboarded) {
                router.push('/onboarding')
                return
            }
        }
    }, [user, isLoading, router, requireOnboarding])

    // Always show loading during SSR or while loading
    if (typeof window === 'undefined' || isLoading) {
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