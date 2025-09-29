"use client"

import { AuthProvider } from "@/shared/hooks/useAuth"
import { ReactNode } from "react"

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
