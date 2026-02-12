import type { ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme-provider'

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}
