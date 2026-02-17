'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  MessageSquare,
  History,
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/utils'
interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const t = useTranslations('nav')
  const tChat = useTranslations('chat')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: t('chat'), href: `/${locale}/chat`, icon: MessageSquare },
    { name: t('history'), href: `/${locale}/history`, icon: History },
  ]

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}/login`)
  }

  const [now, setNow] = useState(() => typeof window !== 'undefined' ? Date.now() : 0)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  const trialEnded =
    user?.subscriptionStatus === 'trial' &&
    user?.trialEndsAt != null &&
    new Date(user.trialEndsAt).getTime() < now

  return (
    <div className="flex h-screen bg-[hsl(var(--app-bg))]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-[hsl(var(--app-border))] transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:z-0',
          sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 lg:px-5 border-b border-[hsl(var(--app-border))]">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white">
                <Image src="/images/daisy-icon.svg" alt="Daisy" width={48} height={48} className="object-contain" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-lg tracking-tight">Daisy</span>
                <p className="text-xs text-muted-foreground">{t('companionSubtitle')}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl text-muted-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-2xl border-2"
              onClick={() => { router.push(`/${locale}/chat?new=1`); setSidebarOpen(false) }}
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className="font-medium">{tChat('newChat')}</span>
            </Button>
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors',
                  pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/15'
                )}
                onClick={() => { router.push(item.href); setSidebarOpen(false) }}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Button>
            ))}
          </nav>

          <div className="p-3 border-t border-[hsl(var(--app-border))]">
            <Link
              href={`/${locale}/profile`}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 mb-2 hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Avatar className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                <AvatarImage src="/images/user-icon.png" alt={user?.name || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="font-medium">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="lg:hidden bg-white border-b border-[hsl(var(--app-border))] px-4 py-3 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white">
              <Image src="/images/daisy-icon.svg" alt="Daisy" width={44} height={44} className="object-contain" />
            </div>
            <span className="font-semibold text-foreground">Daisy</span>
          </Link>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Модалка по истечении пробного периода (3 дня) */}
      {trialEnded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('trialExpiredTitle')}</h3>
            <p className="text-muted-foreground text-sm mb-6">{t('trialExpiredDesc')}</p>
            <Button asChild className="w-full rounded-xl">
              <Link href={`/${locale}#pricing`}>{t('trialExpiredCta')}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
