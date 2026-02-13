'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  MessageSquare,
  History,
  User,
  LogOut,
  Menu,
  X,
  Home
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
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: t('chat'), href: `/${locale}/chat`, icon: MessageSquare },
    { name: t('history'), href: `/${locale}/history`, icon: History },
    { name: t('profile'), href: `/${locale}/profile`, icon: User },
  ]

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}/login`)
  }

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
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
                <Image src="/images/daisy-icon.png" alt="Daisy" width={40} height={40} className="object-cover" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-lg tracking-tight">Daisy</span>
                <p className="text-xs text-muted-foreground">AI-терапевт</p>
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
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors',
                pathname === `/${locale}` && 'bg-primary/10 text-primary hover:bg-primary/15'
              )}
              onClick={() => { router.push(`/${locale}`); setSidebarOpen(false) }}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span className="font-medium">{t('home')}</span>
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
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 mb-2">
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                <AvatarImage src="/images/user-icon.png" alt={user?.name || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                onClick={() => { router.push(`/${locale}/profile`); setSidebarOpen(false) }}
              >
                <User className="w-4 h-4 mr-1" />
                {t('profile')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
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
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm">
              <Image src="/images/daisy-icon.png" alt="Daisy" width={36} height={36} className="object-cover" />
            </div>
            <span className="font-semibold text-foreground">Daisy</span>
          </Link>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
