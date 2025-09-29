"use client"

import { ReactNode } from "react"
import { Providers } from "./providers"
import { ClientAuthProvider } from "./client-auth-provider"

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ClientAuthProvider>{children}</ClientAuthProvider>
    </Providers>
  )
}
