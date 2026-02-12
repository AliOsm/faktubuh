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
  const lastFlash = useRef<string>(null)

  useEffect(() => {
    if (flash?.notice) {
      if (flash.notice !== lastFlash.current) {
        lastFlash.current = flash.notice
        toast.success(flash.notice)
      }
    } else {
      lastFlash.current = null
    }
  }, [flash?.notice])

  useEffect(() => {
    if (flash?.alert) {
      if (flash.alert !== lastFlash.current) {
        lastFlash.current = flash.alert
        toast.error(flash.alert)
      }
    } else {
      lastFlash.current = null
    }
  }, [flash?.alert])

  return (
    <ThemeProvider>
      {children}
      <Toaster dir={i18n.dir()} />
    </ThemeProvider>
  )
}
