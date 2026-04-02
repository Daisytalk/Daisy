import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthService } from '@/shared/lib/auth'
import AdminMetricsClient from './AdminMetricsClient'

type PageProps = { params: Promise<{ locale: string }> }

/** Админка: только после входа в приложение (cookie auth_token). Анонимы перенаправляются на /login. */
export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`)
  }
  let decoded = null
  try {
    decoded = AuthService.verifyToken(token)
  } catch {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`)
  }
  if (!decoded) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`)
  }

  return <AdminMetricsClient />
}
