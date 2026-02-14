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

  // Separate refs for notice and alert
  const lastNotice = useRef<string | null>(null)
  const lastAlert = useRef<string | null>(null)

  useEffect(() => {
    if (flash?.notice && flash.notice !== lastNotice.current) {
      lastNotice.current = flash.notice
      toast.success(flash.notice)
    } else if (!flash?.notice) {
      lastNotice.current = null
    }
  }, [flash?.notice])

  useEffect(() => {
    if (flash?.alert && flash.alert !== lastAlert.current) {
      lastAlert.current = flash.alert
      toast.error(flash.alert)
    } else if (!flash?.alert) {
      lastAlert.current = null
    }
  }, [flash?.alert])

  return (
    <ThemeProvider>
      {children}
      <Toaster dir={i18n.dir()} />
    </ThemeProvider>
  )
}
