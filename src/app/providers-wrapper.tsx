"use client";

import { ReactNode } from "react";
import { AuthProviderClient } from "./auth-provider-client";
import { Providers } from "./providers";
import { AttributionCapture } from "@/shared/components/AttributionCapture";

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AttributionCapture />
      <AuthProviderClient>{children}</AuthProviderClient>
    </Providers>
  );
}
