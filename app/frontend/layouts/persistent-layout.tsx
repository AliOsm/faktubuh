import type { ReactNode } from 'react'

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  return <>{children}</>
}
