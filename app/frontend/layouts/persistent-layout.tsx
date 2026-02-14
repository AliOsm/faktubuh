import { router, usePage } from '@inertiajs/react'
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

  useEffect(() => {
    const handleFinish = () => {
      // Get fresh flash from the page after navigation
      const currentFlash = (router.page?.props as { flash?: { notice?: string; alert?: string } } | undefined)?.flash

      // Show notice if it exists and hasn't been shown yet
      if (currentFlash?.notice && currentFlash.notice !== shownFlash.current.notice) {
        toast.success(currentFlash.notice)
        shownFlash.current.notice = currentFlash.notice
      } else if (!currentFlash?.notice) {
        shownFlash.current.notice = undefined
      }

      // Show alert if it exists and hasn't been shown yet
      if (currentFlash?.alert && currentFlash.alert !== shownFlash.current.alert) {
        toast.error(currentFlash.alert)
        shownFlash.current.alert = currentFlash.alert
      } else if (!currentFlash?.alert) {
        shownFlash.current.alert = undefined
      }
    }

    // Listen to Inertia navigation events
    const removeListener = router.on('finish', handleFinish)

    // Also check on initial mount
    handleFinish()

    return () => {
      removeListener()
    }
  }, [])

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
