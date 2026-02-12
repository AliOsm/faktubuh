import { Link, router, usePage } from '@inertiajs/react'
import { LayoutDashboard, List, Bell, Menu, LogOut, UserIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import DarkModeToggle from '@/components/dark-mode-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { SharedData } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  badge?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const props = usePage<SharedData>().props
  const { auth } = props
  const unreadCount = (props as unknown as { unread_notifications_count?: number }).unread_notifications_count ?? 0
  const user = auth?.user
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentPath = window.location.pathname

  const navItems: NavItem[] = [
    { label: t('nav.dashboard'), href: '/dashboard', icon: <LayoutDashboard className="size-4" /> },
    { label: t('nav.my_debts'), href: '/debts', icon: <List className="size-4" /> },
    { label: t('nav.notifications'), href: '/notifications', icon: <Bell className="size-4" />, badge: unreadCount }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return currentPath === '/' || currentPath === '/dashboard'
    return currentPath.startsWith(href)
  }

  const handleLogout = () => {
    router.delete('/users/sign_out')
  }

  const isRtl = i18n.language === 'ar'
  const appName = t('app.name')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">{t('nav.open_menu')}</span>
          </Button>

          <Link
            href="/"
            className="text-lg font-bold tracking-tight ltr:mr-6 rtl:ml-6"
          >
            {appName}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <Badge variant="destructive" className="rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <DarkModeToggle />
            </div>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative size-8 rounded-full"
                  >
                    <Avatar>
                      <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIcon />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      >
        <SheetContent side={isRtl ? 'right' : 'left'}>
          <SheetHeader>
            <SheetTitle>{appName}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <Badge variant="destructive" className="rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
