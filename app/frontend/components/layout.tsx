import React, { useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Head, usePage } from "@inertiajs/react"
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { toast } = useToast()
  const { flash } = usePage().props

  useEffect(() => {
    if (flash.notice) {
      toast({ description: flash.notice })
    }

    if (flash.alert) {
      toast({
        variant: "destructive",
        description: flash.alert
      })
    }
  }, [flash, toast])

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Head title="فاكتبوه." />

      <main>
        <Navbar />

        <article>{children}</article>

        <Toaster />
      </main>
    </ThemeProvider>
  )
}
