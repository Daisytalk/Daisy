"use client"

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

export function ContextualProviders({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const path = pathname ?? ''

    // Always mount the contextual providers (including AuthProviderClient)
    // so pages like /login and /register can access the auth context.
    // Keeping it dynamically imported client-side to avoid SSR of client-only services.
    const ProvidersWrapper = dynamic(() => import('./providers-wrapper').then(m => m.ProvidersWrapper), {
        ssr: false,
    })

    return <ProvidersWrapper>{children}</ProvidersWrapper>
}
