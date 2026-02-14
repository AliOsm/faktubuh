import { useTranslation } from 'react-i18next'

import { GeometricPattern } from '@/components/patterns/GeometricPattern'
import { cn } from '@/lib/utils'

type AyatContext = 'welcome' | 'creation' | 'detail' | 'witness' | 'settlement'

interface AyatAlDaynProps {
  context: AyatContext
  className?: string
  showPattern?: boolean
}

const CONTEXT_STYLES: Record<
  AyatContext,
  { container: string; verse: string; translation: string; reference: string }
> = {
  welcome: {
    container: 'relative rounded-xl border-2 border-primary/20 bg-card/50 backdrop-blur-sm p-6',
    verse: 'text-center text-2xl leading-loose text-foreground',
    translation: 'mt-4 text-center text-sm text-muted-foreground italic',
    reference: 'mt-2 text-center text-xs text-primary font-semibold'
  },
  creation: {
    container: 'relative rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm p-4',
    verse: 'text-center text-base leading-relaxed text-foreground/90',
    translation: 'mt-3 text-center text-xs text-muted-foreground italic',
    reference: 'mt-1.5 text-center text-xs text-primary/80'
  },
  detail: {
    container: 'relative rounded-lg border border-primary/15 bg-muted/30 p-4',
    verse: 'text-center text-sm leading-relaxed text-foreground/80',
    translation: 'mt-2 text-center text-xs text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-muted-foreground/70'
  },
  witness: {
    container: 'relative rounded-lg border border-primary/15 bg-muted/30 p-4',
    verse: 'text-center text-sm leading-relaxed text-foreground/80',
    translation: 'mt-2 text-center text-xs text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-muted-foreground/70'
  },
  settlement: {
    container: 'relative rounded-lg border-2 border-primary/30 bg-primary/5 p-4',
    verse: 'text-center text-base leading-relaxed text-foreground',
    translation: 'mt-2 text-center text-xs text-muted-foreground',
    reference: 'mt-1 text-center text-xs text-primary'
  }
}

export default function AyatAlDayn({ context, className, showPattern = true }: AyatAlDaynProps) {
  const { t } = useTranslation()
  const styles = CONTEXT_STYLES[context]

  return (
    <div className={cn(styles.container, className)}>
      {showPattern && (context === 'welcome' || context === 'creation') && (
        <GeometricPattern variant="arabesque" opacity={0.03} />
      )}

      <div className="relative z-10 space-y-2">
        <p
          className={cn('font-quran', styles.verse)}
          dir="rtl"
          lang="ar"
        >
          {t(`ayat.${context}.verse`)}
        </p>
        <p className={styles.translation}>{t(`ayat.${context}.translation`)}</p>
        <p className={styles.reference}>{t(`ayat.${context}.reference`)}</p>
      </div>
    </div>
  )
}
