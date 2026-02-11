import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

type AyatContext = 'welcome' | 'creation' | 'detail' | 'witness' | 'settlement'

interface AyatAlDaynProps {
  context: AyatContext
  className?: string
}

const CONTEXT_STYLES: Record<
  AyatContext,
  { container: string; verse: string; translation: string; reference: string }
> = {
  welcome: {
    container: 'rounded-lg border bg-muted/50 p-4',
    verse: 'text-center text-lg leading-relaxed text-foreground',
    translation: 'mt-2 text-center text-sm text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-muted-foreground'
  },
  creation: {
    container: 'rounded-lg border border-border/50 bg-muted/30 p-4',
    verse: 'text-center text-sm leading-relaxed text-foreground/80',
    translation: 'mt-2 text-center text-xs text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-muted-foreground/70'
  },
  detail: {
    container: 'rounded-lg border border-border/50 bg-muted/30 p-4',
    verse: 'text-center text-sm leading-relaxed text-foreground/80',
    translation: 'mt-2 text-center text-xs text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-muted-foreground/70'
  },
  witness: {
    container: 'rounded-lg border border-border/50 bg-muted/30 p-4',
    verse: 'text-center text-sm leading-relaxed text-foreground/80',
    translation: 'mt-2 text-center text-xs text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-muted-foreground/70'
  },
  settlement: {
    container: 'rounded-md border border-green-200 bg-white/60 p-3',
    verse: 'text-center text-sm leading-relaxed text-green-900',
    translation: 'mt-1.5 text-center text-xs text-green-700',
    reference: 'mt-0.5 text-center text-xs text-green-600/70'
  }
}

export default function AyatAlDayn({ context, className }: AyatAlDaynProps) {
  const { t } = useTranslation()
  const styles = CONTEXT_STYLES[context]

  return (
    <div className={cn(styles.container, className)}>
      <p
        className={cn('font-arabic', styles.verse)}
        dir="rtl"
      >
        {t(`ayat.${context}.verse`)}
      </p>
      <p className={styles.translation}>{t(`ayat.${context}.translation`)}</p>
      <p className={styles.reference}>{t(`ayat.${context}.reference`)}</p>
    </div>
  )
}
