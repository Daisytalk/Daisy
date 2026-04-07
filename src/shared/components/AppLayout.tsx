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
  Plus,
  Settings,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/utils'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const t = useTranslations('nav')
  const tChat = useTranslations('chat')
  const tProfile = useTranslations('profile')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = [
    { name: t('chat'), href: `/${locale}/chat`, icon: MessageSquare },
    { name: t('history'), href: `/${locale}/history`, icon: History },
    { name: t('profile'), href: `/${locale}/profile`, icon: User },
    { name: t('settings'), href: `/${locale}/settings`, icon: Settings },
    { name: t('upgradePlan'), href: `/${locale}/pricing`, icon: CreditCard },
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
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-[hsl(var(--app-border))] transform transition-all duration-300 ease-in-out flex flex-col',
          sidebarOpen ? 'translate-x-0 shadow-xl w-[280px]' : '-translate-x-full w-[280px]',
          'lg:translate-x-0 lg:static lg:z-0',
          isCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:border-none' : 'lg:w-[280px] lg:opacity-100'
        )}
      >
        <div className="flex flex-col h-full w-[280px]">
          <div className="flex items-center justify-between p-4 lg:px-5 border-b border-transparent">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white">
                <Image src="/images/daisy-icon.svg" alt="Daisy" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-lg tracking-tight">Daisy</span>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <div className="hidden lg:flex items-center">
                <LanguageSwitcher variant="light" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex rounded-xl text-muted-foreground hover:bg-muted/60"
                onClick={() => setIsCollapsed(true)}
              >
                <PanelLeftClose className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl text-muted-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="px-3 pb-3 pt-1 border-b border-[hsl(var(--app-border))]">
            <Link
              href={`/${locale}/profile/dynamics`}
              className="flex items-center gap-2 p-2 rounded-[20px] bg-[#f7f7f7] cursor-pointer select-none hover:bg-[#ededed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
              aria-label={
                user?.email
                  ? `${user?.name || 'User'}, ${user.email}. ${tProfile('dynamicsPage.profileCardAria')}`
                  : tProfile('dynamicsPage.profileCardAria')
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Avatar className="h-10 w-10 rounded-full overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center pointer-events-none">
                <AvatarImage src="/images/user-icon.png" alt="" className="object-cover" />
                <AvatarFallback className="bg-white text-pink-500 text-sm font-medium rounded-full">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[15px] font-medium text-[#2d2d2d] truncate">{user?.name || 'User'}</p>
                <p className="text-[13px] text-[#6b6b6b] truncate">{user?.email}</p>
              </div>
            </Link>
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
                  (pathname === item.href || pathname.startsWith(item.href + '/')) && 'bg-primary/10 text-primary hover:bg-primary/15'
                )}
                onClick={() => { router.push(item.href); setSidebarOpen(false) }}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Button>
            ))}
          </nav>

          <div className="p-3 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#e57373] hover:text-red-400 transition-colors mt-2"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {isCollapsed && (
          <div className="hidden lg:flex absolute top-4 left-4 z-40 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:bg-muted/60"
              onClick={() => setIsCollapsed(false)}
            >
              <PanelLeftOpen className="w-5 h-5" />
            </Button>
            <LanguageSwitcher variant="light" />
          </div>
        )}
        <header className="lg:hidden bg-white border-b border-[hsl(var(--app-border))] px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-muted-foreground shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link href={`/${locale}`} className="flex items-center gap-2 min-w-0">
            <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white shrink-0">
              <Image src="/images/daisy-icon.svg" alt="Daisy" width={44} height={44} className="object-contain" />
            </div>
            <span className="font-semibold text-foreground truncate">Daisy</span>
          </Link>
          <LanguageSwitcher variant="light" />
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
              <Link href={`/${locale}/pricing`}>{t('trialExpiredCta')}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
