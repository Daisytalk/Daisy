"use client"

import { ReactNode } from 'react'
import { ProvidersWrapper } from './providers-wrapper'

export function ContextualProviders({ children }: { children: ReactNode }) {
    return <ProvidersWrapper>{children}</ProvidersWrapper>
}
