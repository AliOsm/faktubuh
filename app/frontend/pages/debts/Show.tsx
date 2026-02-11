import { Head, router, usePage } from '@inertiajs/react'
import { AlertTriangle, Calendar, CheckCircle, Clock, CreditCard, FileText, Shield, Users, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'
import type { SharedData } from '@/types'

interface UserSummary {
  id: number
  full_name: string
  personal_id: string
}

interface DebtData {
  id: number
  mode: 'mutual' | 'personal'
  creator_role: 'lender' | 'borrower'
  status: 'pending' | 'active' | 'settled' | 'rejected'
  amount: number
  currency: string
  description: string | null
  deadline: string
  installment_type: string
  counterparty_name: string | null
  lender: UserSummary
  borrower: UserSummary | null
  created_at: string
}

interface InstallmentData {
  id: number
  amount: number
  due_date: string
  status: 'upcoming' | 'submitted' | 'approved' | 'rejected' | 'overdue'
  description: string | null
}

interface PaymentData {
  id: number
  amount: number
  submitted_at: string
  status: 'pending' | 'approved' | 'rejected'
  description: string | null
  rejection_reason: string | null
  submitter_name: string
  installment_id: number | null
}

interface WitnessData {
  id: number
  user_name: string
  status: 'invited' | 'confirmed' | 'declined'
  confirmed_at: string | null
}

interface ShowProps {
  debt: DebtData
  installments: InstallmentData[]
  payments: PaymentData[]
  witnesses: WitnessData[]
  current_user_id: number
  is_confirming_party: boolean
  is_creator: boolean
  [key: string]: unknown
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()

  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    settled: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    upcoming: 'bg-slate-100 text-slate-800 border-slate-200',
    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    invited: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200'
  }

  const label = t(`debt_detail.status.${status}`, t(`debt_detail.witnesses.${status}`, status))

  return (
    <Badge
      variant="outline"
      className={cn('border font-medium', variants[status])}
    >
      {label}
    </Badge>
  )
}

function InstallmentStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()

  const variants: Record<string, string> = {
    upcoming: 'bg-slate-100 text-slate-800 border-slate-200',
    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    overdue: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Badge
      variant="outline"
      className={cn('border font-medium', variants[status])}
    >
      {t(`debt_detail.status.${status}`, status)}
    </Badge>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Badge
      variant="outline"
      className={cn('border font-medium', variants[status])}
    >
      {status}
    </Badge>
  )
}

function isOverdue(dueDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function AyatBanner() {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <p
        className="text-center font-arabic text-sm leading-relaxed text-foreground/80"
        dir="rtl"
      >
        {t('debt_detail.ayat_verse')}
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">{t('debt_detail.ayat_translation')}</p>
      <p className="mt-1 text-center text-xs text-muted-foreground/70">{t('debt_detail.ayat_reference')}</p>
    </div>
  )
}

function WitnessReminder({ mode, witnesses }: { mode: string; witnesses: WitnessData[] }) {
  const { t } = useTranslation()
  const hasConfirmedWitness = witnesses.some((w) => w.status === 'confirmed')

  if (hasConfirmedWitness) return null

  const isStrong = mode === 'personal'
  const message = isStrong ? t('debt_detail.witness_reminder.strong') : t('debt_detail.witness_reminder.standard')

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        isStrong ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-yellow-200 bg-yellow-50 text-yellow-900'
      )}
    >
      <AlertTriangle className={cn('mt-0.5 size-5 shrink-0', isStrong ? 'text-amber-600' : 'text-yellow-600')} />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function ConfirmationBanner({ debt }: { debt: DebtData }) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState<'confirm' | 'reject' | null>(null)

  const creatorName = debt.creator_role === 'lender' ? debt.lender.full_name : (debt.borrower?.full_name ?? '')

  function handleConfirm() {
    setProcessing('confirm')
    router.post(
      `/debts/${debt.id}/confirm`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  function handleReject() {
    setProcessing('reject')
    router.post(
      `/debts/${debt.id}/reject`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">{t('debt_detail.confirmation.banner_title')}</h3>
              <p className="mt-1 text-sm text-amber-800">
                {t('debt_detail.confirmation.banner_description', { creator: creatorName })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleConfirm}
              disabled={processing !== null}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="size-4 ltr:mr-2 rtl:ml-2" />
              {processing === 'confirm'
                ? t('debt_detail.confirmation.confirming')
                : t('debt_detail.confirmation.confirm_button')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing !== null}
            >
              <XCircle className="size-4 ltr:mr-2 rtl:ml-2" />
              {processing === 'reject'
                ? t('debt_detail.confirmation.rejecting')
                : t('debt_detail.confirmation.reject_button')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AwaitingConfirmation({ debt }: { debt: DebtData }) {
  const { t } = useTranslation()

  const confirmingPartyName = debt.creator_role === 'lender' ? (debt.borrower?.full_name ?? '') : debt.lender.full_name

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="flex items-center gap-3 p-4 sm:p-6">
        <Clock className="size-5 shrink-0 text-blue-600" />
        <p className="text-sm font-medium text-blue-800">
          {t('debt_detail.confirmation.awaiting', { name: confirmingPartyName })}
        </p>
      </CardContent>
    </Card>
  )
}

export default function Show({ debt, installments, payments, witnesses, is_confirming_party, is_creator }: ShowProps) {
  const { t } = useTranslation()
  const { flash } = usePage<SharedData>().props

  useEffect(() => {
    if (flash?.notice) {
      toast.success(flash.notice)
    }
  }, [flash?.notice])

  const installmentTypeLabel = t(`debt_creation.details.installment.${debt.installment_type}`, debt.installment_type)

  return (
    <>
      <Head title={t('debt_detail.title')} />

      <div className="flex flex-col gap-6 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{t('debt_detail.title')}</h1>
          <StatusBadge status={debt.status} />
          <Badge variant="secondary">{t(`debt_detail.mode.${debt.mode}`)}</Badge>
        </div>

        {/* Confirmation Banner / Awaiting Message */}
        {debt.status === 'pending' && is_confirming_party && <ConfirmationBanner debt={debt} />}
        {debt.status === 'pending' && is_creator && !is_confirming_party && <AwaitingConfirmation debt={debt} />}

        {/* Debt Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {t('debt_detail.amount')}: {debt.amount.toLocaleString()} {debt.currency}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.lender')}</p>
                <p className="text-sm">{debt.lender.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.borrower')}</p>
                <p className="text-sm">
                  {debt.mode === 'mutual' ? (debt.borrower?.full_name ?? '—') : (debt.counterparty_name ?? '—')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.deadline')}</p>
                <p className="flex items-center gap-1.5 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  {formatDate(debt.deadline)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.installment_type')}</p>
                <p className="text-sm">{installmentTypeLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.description')}</p>
                <p className="text-sm text-foreground/80">{debt.description || t('debt_detail.no_description')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.created_at')}</p>
                <p className="flex items-center gap-1.5 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  {formatDate(debt.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installment Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              {t('debt_detail.installments.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {installments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('debt_detail.installments.no_installments')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2 text-start font-medium">{t('debt_detail.installments.amount')}</th>
                      <th className="pb-2 text-start font-medium">{t('debt_detail.installments.due_date')}</th>
                      <th className="pb-2 text-start font-medium">{t('debt_detail.installments.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((inst) => (
                      <tr
                        key={inst.id}
                        className={cn(
                          'border-b last:border-b-0',
                          inst.status === 'overdue' || (inst.status === 'upcoming' && isOverdue(inst.due_date))
                            ? 'bg-red-50 text-red-900'
                            : ''
                        )}
                      >
                        <td className="py-2.5">
                          {inst.amount.toLocaleString()} {debt.currency}
                        </td>
                        <td className="py-2.5">{formatDate(inst.due_date)}</td>
                        <td className="py-2.5">
                          {inst.status === 'upcoming' && isOverdue(inst.due_date) ? (
                            <InstallmentStatusBadge status="overdue" />
                          ) : (
                            <InstallmentStatusBadge status={inst.status} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              {t('debt_detail.payments.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('debt_detail.payments.no_payments')}</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col gap-1.5 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {payment.amount.toLocaleString()} {debt.currency}
                      </span>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {t('debt_detail.payments.date')}: {formatDate(payment.submitted_at)}
                      </span>
                      <span>
                        {t('debt_detail.payments.submitted_by')}: {payment.submitter_name}
                      </span>
                    </div>
                    {payment.description && <p className="text-xs text-foreground/70">{payment.description}</p>}
                    {payment.status === 'rejected' && payment.rejection_reason && (
                      <p className="text-xs text-red-600">
                        {t('debt_detail.payments.rejection_reason')}: {payment.rejection_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Witnesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t('debt_detail.witnesses.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {witnesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('debt_detail.witnesses.no_witnesses')}</p>
            ) : (
              <div className="space-y-2">
                {witnesses.map((witness) => (
                  <div
                    key={witness.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{witness.user_name}</span>
                    </div>
                    <StatusBadge status={witness.status} />
                  </div>
                ))}
              </div>
            )}
            <WitnessReminder
              mode={debt.mode}
              witnesses={witnesses}
            />
          </CardContent>
        </Card>

        {/* Ayat al-Dayn Banner */}
        <AyatBanner />
      </div>
    </>
  )
}

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>
