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
  User,
  Settings,
  CreditCard,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
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
  const [isCollapsed, setIsCollapsed] = useState(false)

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

          <div className="p-3 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-2 rounded-[20px] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer text-left"
                >
                  <Avatar className="h-10 w-10 rounded-full overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center">
                    <AvatarImage src="/images/user-icon.png" alt={user?.name || 'User'} className="object-cover" />
                    <AvatarFallback className="bg-white text-pink-500 text-sm font-medium rounded-full">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#2d2d2d] truncate">{user?.name || 'User'}</p>
                    <p className="text-[13px] text-[#6b6b6b] truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6b6b6b] shrink-0" />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/${locale}/pricing`;
                    }}
                    className="shrink-0 px-4 py-1.5 rounded-[14px] bg-[#4a4a4a] text-white text-[13px] font-medium hover:bg-[#3a3a3a] transition-colors ml-1"
                  >
                    {t('upgrade')}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" sideOffset={12} className="w-[260px] rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-2 border-none bg-white">
                  <DropdownMenuItem
                  className={cn(
                    "h-11 rounded-[12px] cursor-pointer mb-1 px-3",
                    pathname.startsWith(`/${locale}/profile`)
                      ? "text-[#4a8fb3] bg-[#edf6fa] focus:bg-[#e0f0f7] focus:text-[#4a8fb3]"
                      : "text-[#4a4a4a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
                  )}
                  onClick={() => { router.push(`/${locale}/profile`); setSidebarOpen(false) }}
                >
                  <User className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "h-11 rounded-[12px] cursor-pointer mb-1 px-3",
                    pathname.startsWith(`/${locale}/settings`)
                      ? "text-[#4a8fb3] bg-[#edf6fa] focus:bg-[#e0f0f7] focus:text-[#4a8fb3]"
                      : "text-[#4a4a4a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
                  )}
                  onClick={() => { router.push(`/${locale}/settings`); setSidebarOpen(false) }}
                >
                  <Settings className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "h-11 rounded-[12px] cursor-pointer px-3",
                    pathname.startsWith(`/${locale}/pricing`)
                      ? "text-[#4a8fb3] bg-[#edf6fa] focus:bg-[#e0f0f7] focus:text-[#4a8fb3]"
                      : "text-[#4a4a4a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
                  )}
                  onClick={() => {
                    setSidebarOpen(false)
                    window.location.href = `/${locale}/pricing`
                  }}
                >
                  <CreditCard className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">{t('upgradePlan')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex absolute top-4 left-4 z-40 rounded-xl text-muted-foreground hover:bg-muted/60"
            onClick={() => setIsCollapsed(false)}
          >
            <PanelLeftOpen className="w-5 h-5" />
          </Button>
        )}
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
              <Link href={`/${locale}/pricing`}>{t('trialExpiredCta')}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
