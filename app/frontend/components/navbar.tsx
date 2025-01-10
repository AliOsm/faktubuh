import { Link, usePage } from "@inertiajs/react"
import { Menu, LogOut, Settings } from 'lucide-react'

import { Button } from "@/components/ui/button"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { ThemeToggle } from "@/components/theme-toggle"
import { deviseSessions, usersRegistrations } from "@/api"

const navItems = [
  // { href: "/example", label: "Example" },
]

export function Navbar() {
  const { current_user } = usePage().props

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-2">
        <Link href="/" className="me-6 font-['Alexandria'] font-bold text-xl">
          فاكتبوه.
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} className={navigationMenuTriggerStyle()}>
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ms-auto space-x-2 rtl:space-x-reverse">
          <ThemeToggle />

          {current_user && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button type="submit" variant="outline" size="icon" asChild>
                    <Link href={usersRegistrations.edit.path()}>
                      <Settings className="size-[1.2rem] -scale-x-100" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>الإعدادات</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {current_user && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button type="submit" variant="outline" size="icon" onClick={() => { deviseSessions.destroy() }}>
                    <LogOut className="size-[1.2rem] -scale-x-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>تسجيل الخروج</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left">
              <div className="flex flex-col space-y-4 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
