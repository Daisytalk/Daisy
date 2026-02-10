'use client'

import { ReactNode, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import { 
  MessageSquare, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Sparkles,
  Menu,
  X,
  Home
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/utils'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Chat', href: `/${locale}/chat`, icon: MessageSquare },
    { name: 'History', href: `/${locale}/history`, icon: History },
    { name: 'Profile', href: `/${locale}/profile`, icon: User },
  ]

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}/login`)
  }

  return (
    <div className="flex h-screen bg-app-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-app-surface border-r border-app-border shadow-app-md transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:z-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-app-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-app-lg bg-primary flex items-center justify-center shadow-app">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">Daisy</h1>
                <p className="text-xs text-muted-foreground">AI Therapist</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-app text-muted-foreground hover:text-foreground hover:bg-app-surface-hover"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-11 rounded-app text-muted-foreground hover:text-foreground hover:bg-app-surface-hover',
                pathname === `/${locale}` && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              )}
              onClick={() => router.push(`/${locale}`)}
            >
              <Home className="w-5 h-5 shrink-0" />
              Home
            </Button>
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-11 rounded-app text-muted-foreground hover:text-foreground hover:bg-app-surface-hover',
                  pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                )}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-app-border space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-app bg-app-bg">
              <Avatar className="h-10 w-10 rounded-app">
                <AvatarFallback className="bg-primary/90 text-primary-foreground text-sm font-medium rounded-app">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-9 rounded-app text-muted-foreground hover:text-foreground hover:bg-app-surface-hover"
                onClick={() => router.push(`/${locale}/profile`)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-9 rounded-app text-red-600 hover:text-red-700 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="lg:hidden bg-app-surface border-b border-app-border px-4 py-3 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-app text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-app bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Daisy</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
