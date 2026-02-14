import { usePage } from '@inertiajs/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  const { i18n } = useTranslation()
  const { flash } = usePage().props as { flash?: { notice?: string; alert?: string } }

  const shownFlash = useRef<{ notice?: string; alert?: string }>({})

  // Fallback: also check when flash changes (in case router events don't fire)
  useEffect(() => {
    if (flash?.notice && flash.notice !== shownFlash.current.notice) {
      toast.success(flash.notice)
      shownFlash.current.notice = flash.notice
    } else if (!flash?.notice && shownFlash.current.notice) {
      shownFlash.current.notice = undefined
    }
  }, [flash?.notice])

  useEffect(() => {
    if (flash?.alert && flash.alert !== shownFlash.current.alert) {
      toast.error(flash.alert)
      shownFlash.current.alert = flash.alert
    } else if (!flash?.alert && shownFlash.current.alert) {
      shownFlash.current.alert = undefined
    }
  }, [flash?.alert])

  return (
    <ThemeProvider>
      {children}
      <Toaster dir={i18n.dir()} />
    </ThemeProvider>
  )
}
