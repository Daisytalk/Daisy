"use client"

import { ReactNode } from "react"
import { Providers } from "./providers"

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>
}
