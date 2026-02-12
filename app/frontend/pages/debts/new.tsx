import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, usePage } from '@inertiajs/react'
import * as Flags from 'country-flag-icons/react/3x2'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { HandCoins, HandHeart, Users, User, Check, ArrowLeft, Loader2, CheckCircle2, XCircle, CalendarIcon } from 'lucide-react'
import { arSA } from 'react-day-picker/locale'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AyatAlDayn from '@/components/ayat-al-dayn'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'

type Role = 'lender' | 'borrower'
type Mode = 'mutual' | 'personal'
type InstallmentType = 'lump_sum' | 'monthly' | 'bi_weekly' | 'quarterly' | 'yearly' | 'custom_split'

interface LookedUpUser {
  id: number
  full_name: string
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: 'US' },
  { code: 'EUR', name: 'Euro', flag: 'EU' },
  { code: 'GBP', name: 'British Pound', flag: 'GB' },
  { code: 'CAD', name: 'Canadian Dollar', flag: 'CA' },
  { code: 'AUD', name: 'Australian Dollar', flag: 'AU' },
  { code: 'CHF', name: 'Swiss Franc', flag: 'CH' },
  { code: 'JPY', name: 'Japanese Yen', flag: 'JP' },
  { code: 'CNY', name: 'Chinese Yuan', flag: 'CN' },
  { code: 'INR', name: 'Indian Rupee', flag: 'IN' },
  { code: 'SAR', name: 'Saudi Riyal', flag: 'SA' },
  { code: 'AED', name: 'UAE Dirham', flag: 'AE' },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: 'KW' },
  { code: 'BHD', name: 'Bahraini Dinar', flag: 'BH' },
  { code: 'OMR', name: 'Omani Rial', flag: 'OM' },
  { code: 'QAR', name: 'Qatari Riyal', flag: 'QA' },
  { code: 'JOD', name: 'Jordanian Dinar', flag: 'JO' },
  { code: 'EGP', name: 'Egyptian Pound', flag: 'EG' },
  { code: 'MAD', name: 'Moroccan Dirham', flag: 'MA' },
  { code: 'TND', name: 'Tunisian Dinar', flag: 'TN' },
  { code: 'DZD', name: 'Algerian Dinar', flag: 'DZ' },
  { code: 'LBP', name: 'Lebanese Pound', flag: 'LB' },
  { code: 'IQD', name: 'Iraqi Dinar', flag: 'IQ' },
  { code: 'SYP', name: 'Syrian Pound', flag: 'SY' },
  { code: 'LYD', name: 'Libyan Dinar', flag: 'LY' },
  { code: 'SDG', name: 'Sudanese Pound', flag: 'SD' },
  { code: 'YER', name: 'Yemeni Rial', flag: 'YE' },
  { code: 'TRY', name: 'Turkish Lira', flag: 'TR' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: 'PK' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: 'BD' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: 'MY' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: 'ID' }
] as const

const INSTALLMENT_TYPES: InstallmentType[] = ['lump_sum', 'monthly', 'bi_weekly', 'quarterly', 'yearly', 'custom_split']

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

function PersonalIdLookup({
  value,
  onChange,
  lookedUpUser,
  onLookupResult,
  lookupError,
  onLookupError,
  isLooking,
  onIsLooking
}: {
  value: string
  onChange: (val: string) => void
  lookedUpUser: LookedUpUser | null
  onLookupResult: (user: LookedUpUser | null) => void
  lookupError: string | null
  onLookupError: (err: string | null) => void
  isLooking: boolean
  onIsLooking: (val: boolean) => void
}) {
  const { t } = useTranslation()

  const lookupUser = useCallback(
    async (personalId: string) => {
      if (personalId.length !== 6) return

      onIsLooking(true)
      onLookupError(null)
      onLookupResult(null)

      try {
        const response = await fetch(`/users/lookup?personal_id=${encodeURIComponent(personalId)}`)
        if (response.ok) {
          const user: LookedUpUser = await response.json()
          onLookupResult(user)
        } else {
          onLookupError(t('debt_creation.details.user_not_found'))
        }
      } catch {
        onLookupError(t('debt_creation.details.lookup_error'))
      } finally {
        onIsLooking(false)
      }
    },
    [t, onIsLooking, onLookupError, onLookupResult]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().slice(0, 6)
    onChange(raw)
    onLookupResult(null)
    onLookupError(null)

    if (raw.length === 6) {
      lookupUser(raw)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{t('debt_creation.details.personal_id')}</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder={t('debt_creation.details.personal_id_placeholder')}
          maxLength={6}
          className="font-mono uppercase tracking-widest"
        />
        {isLooking && (
          <div className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {lookedUpUser && (
          <div className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3">
            <CheckCircle2 className="size-4 text-green-500" />
          </div>
        )}
        {lookupError && (
          <div className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3">
            <XCircle className="size-4 text-destructive" />
          </div>
        )}
      </div>
      {lookedUpUser && <p className="text-sm text-green-600">{lookedUpUser.full_name}</p>}
      {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}
    </div>
  )
}

function DetailsForm({ role, mode, onBack }: { role: Role; mode: Mode; onBack: () => void }) {
  const { t, i18n } = useTranslation()
  const { props } = usePage()
  const serverErrors = (props as unknown as { errors?: Record<string, string[]> }).errors

  const [personalId, setPersonalId] = useState('')
  const [lookedUpUser, setLookedUpUser] = useState<LookedUpUser | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [isLooking, setIsLooking] = useState(false)

  const [counterpartyName, setCounterpartyName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [deadline, setDeadline] = useState<Date | undefined>()
  const [description, setDescription] = useState('')
  const [installmentType, setInstallmentType] = useState<InstallmentType>('lump_sum')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (serverErrors) {
      const mapped: Record<string, string> = {}
      for (const [key, messages] of Object.entries(serverErrors)) {
        if (Array.isArray(messages)) {
          mapped[key] = messages[0]
        }
      }
      setErrors(mapped)
    }
  }, [serverErrors])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (mode === 'mutual' && !lookedUpUser) {
      newErrors.personal_id = t('debt_creation.details.personal_id_required')
    }

    if (mode === 'personal' && !counterpartyName.trim()) {
      newErrors.counterparty_name = t('debt_creation.details.counterparty_name_required')
    }

    const parsedAmount = parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = t('debt_creation.details.amount_positive')
    }

    if (!currency) {
      newErrors.currency = t('debt_creation.details.currency_required')
    }

    if (!deadline) {
      newErrors.deadline = t('debt_creation.details.deadline_required')
    } else if (deadline <= today) {
      newErrors.deadline = t('debt_creation.details.deadline_future')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    router.post(
      '/debts',
      {
        debt: {
          creator_role: role,
          mode,
          amount: parseFloat(amount),
          currency,
          deadline: deadline ? format(deadline, 'yyyy-MM-dd') : '',
          description,
          installment_type: installmentType,
          counterparty_name: mode === 'personal' ? counterpartyName : undefined,
          counterparty_personal_id: mode === 'mutual' ? personalId : undefined
        }
      },
      {
        onFinish: () => setSubmitting(false)
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('debt_creation.details.title')}</CardTitle>
        <CardDescription>{t('debt_creation.details.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {mode === 'mutual' && (
            <PersonalIdLookup
              value={personalId}
              onChange={setPersonalId}
              lookedUpUser={lookedUpUser}
              onLookupResult={setLookedUpUser}
              lookupError={lookupError}
              onLookupError={setLookupError}
              isLooking={isLooking}
              onIsLooking={setIsLooking}
            />
          )}

          {mode === 'personal' && (
            <div className="space-y-2">
              <Label>{t('debt_creation.details.counterparty_name')}</Label>
              <Input
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                placeholder={t('debt_creation.details.counterparty_name_placeholder')}
              />
              {errors.counterparty_name && <p className="text-sm text-destructive">{errors.counterparty_name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('debt_creation.details.amount')}</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('debt_creation.details.amount_placeholder')}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('debt_creation.details.currency')}</Label>
            <Select
              value={currency}
              onValueChange={setCurrency}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('debt_creation.details.currency_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => {
                  const FlagIcon = Flags[c.flag as keyof typeof Flags]
                  return (
                    <SelectItem
                      key={c.code}
                      value={c.code}
                    >
                      <span className="inline-flex items-center gap-2">
                        {FlagIcon && <FlagIcon className="inline-block h-3.5 w-5 rounded-sm" />}
                        {c.code} — {c.name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.currency && <p className="text-sm text-destructive">{errors.currency}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('debt_creation.details.deadline')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !deadline && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="size-4" />
                  {deadline
                    ? format(deadline, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
                    : t('debt_creation.details.pick_date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={{ before: new Date(today.getTime() + 86400000) }}
                  locale={i18n.language === 'ar' ? arSA : undefined}
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('debt_creation.details.description_label')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('debt_creation.details.description_placeholder')}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>{t('debt_creation.details.installment_type')}</Label>
            <RadioGroup
              value={installmentType}
              onValueChange={(val) => setInstallmentType(val as InstallmentType)}
              className="space-y-2"
            >
              {INSTALLMENT_TYPES.map((type) => (
                <label
                  key={type}
                  htmlFor={`installment-${type}`}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50',
                    installmentType === type ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <RadioGroupItem
                    value={type}
                    id={`installment-${type}`}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t(`debt_creation.details.installment.${type}`)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(`debt_creation.details.installment.${type}_description`)}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t('common.back')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? t('debt_creation.details.creating') : t('debt_creation.details.create_debt')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
    } else if (step === 3) {
      setStep(2)
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
                  <ArrowLeft className="size-4 rtl:rotate-180" />
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

        {step === 3 && mode && role && (
          <DetailsForm
            role={role}
            mode={mode}
            onBack={handleBack}
          />
        )}

        <AyatAlDayn context="creation" />
      </div>
    </div>
  )
}

NewDebt.layout = [AppLayout]

export default NewDebt
