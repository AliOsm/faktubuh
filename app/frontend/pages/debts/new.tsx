import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HandCoins, HandHeart, Users, User, Check, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'

type Role = 'lender' | 'borrower'
type Mode = 'mutual' | 'personal'

function SelectableCard({
  selected,
  onClick,
  icon,
  title,
  description
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all hover:border-primary/50 hover:bg-accent/50',
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'
      )}
    >
      {selected && (
        <div className="absolute top-3 ltr:right-3 rtl:left-3">
          <Check className="size-5 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

function AyatBanner() {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <p
        className="text-center font-arabic text-sm leading-relaxed text-foreground/80"
        dir="rtl"
      >
        يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">{t('debt_creation.ayat_translation')}</p>
      <p className="mt-1 text-center text-xs text-muted-foreground/70">{t('debt_creation.ayat_reference')}</p>
    </div>
  )
}

function NewDebt() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role | null>(null)
  const [mode, setMode] = useState<Mode | null>(null)

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole)
  }

  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode)
  }

  const handleNext = () => {
    if (step === 1 && role) {
      setStep(2)
    } else if (step === 2 && mode) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setMode(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t('debt_creation.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('debt_creation.step_indicator', { current: step, total: 3 })}
          </p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('debt_creation.role.title')}</CardTitle>
              <CardDescription>{t('debt_creation.role.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SelectableCard
                  selected={role === 'lender'}
                  onClick={() => handleRoleSelect('lender')}
                  icon={<HandCoins className="size-6" />}
                  title={t('debt_creation.role.lender')}
                  description={t('debt_creation.role.lender_description')}
                />
                <SelectableCard
                  selected={role === 'borrower'}
                  onClick={() => handleRoleSelect('borrower')}
                  icon={<HandHeart className="size-6" />}
                  title={t('debt_creation.role.borrower')}
                  description={t('debt_creation.role.borrower_description')}
                />
              </div>
              <Button
                className="w-full"
                disabled={!role}
                onClick={handleNext}
              >
                {t('common.next')}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('debt_creation.mode.title')}</CardTitle>
              <CardDescription>{t('debt_creation.mode.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SelectableCard
                  selected={mode === 'mutual'}
                  onClick={() => handleModeSelect('mutual')}
                  icon={<Users className="size-6" />}
                  title={t('debt_creation.mode.mutual')}
                  description={t('debt_creation.mode.mutual_description')}
                />
                <SelectableCard
                  selected={mode === 'personal'}
                  onClick={() => handleModeSelect('personal')}
                  icon={<User className="size-6" />}
                  title={t('debt_creation.mode.personal')}
                  description={t('debt_creation.mode.personal_description')}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleBack}
                >
                  <ArrowLeft className="size-4" />
                  {t('common.back')}
                </Button>
                <Button
                  className="flex-1"
                  disabled={!mode}
                  onClick={handleNext}
                >
                  {t('common.next')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('debt_creation.details.title')}</CardTitle>
              <CardDescription>{t('debt_creation.details.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('debt_creation.details.coming_soon')}</p>
            </CardContent>
          </Card>
        )}

        <AyatBanner />
      </div>
    </div>
  )
}

NewDebt.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>

export default NewDebt
