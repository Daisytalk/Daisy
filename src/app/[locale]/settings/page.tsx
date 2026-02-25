import { ClientOnly } from '@/shared/components/ClientOnly'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { SettingsContent } from '@/shared/components/profile/SettingsContent'

export default function SettingsPage() {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <SettingsContent />
      </ProtectedRoute>
    </ClientOnly>
  )
}
