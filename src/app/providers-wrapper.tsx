"use client";

import { ReactNode } from "react";
import { AuthProviderClient } from "./auth-provider-client";
import { Providers } from "./providers";

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AuthProviderClient>{children}</AuthProviderClient>
    </Providers>
  );
}
