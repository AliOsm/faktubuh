import { Head, router } from '@inertiajs/react'
import {
  AlertTriangle,
  Archive,
  ArrowUpCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Link2,
  Loader2,
  Plus,
  Search,
  Shield,
  UserPlus,
  Users,
  XCircle
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AyatAlDayn from '@/components/ayat-al-dayn'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'


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
  upgrade_recipient_id: number | null
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
  self_reported: boolean
}

interface WitnessData {
  id: number
  user_name: string
  status: 'invited' | 'confirmed' | 'declined'
  confirmed_at: string | null
}

interface PaginationMeta {
  page: number
  last: number
  prev: number | null
  next: number | null
  pages: number
  count: number
  from: number
  to: number
}

interface ShowProps {
  debt: DebtData
  installments: InstallmentData[]
  installments_pagination: PaginationMeta
  payments: PaymentData[]
  witnesses: WitnessData[]
  current_user_id: number
  is_confirming_party: boolean
  is_creator: boolean
  is_borrower: boolean
  is_lender: boolean
  remaining_balance: number
  can_manage_witnesses: boolean
  is_invited_witness: number | null
  can_upgrade: boolean
  is_upgrade_recipient: boolean
  upgrade_recipient_name: string | null
  [key: string]: unknown
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()

  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    settled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    upcoming: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800',
    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    overdue: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    invited: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    confirmed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    declined: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
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
    upcoming: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800',
    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    overdue: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
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
  const { t } = useTranslation()

  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
  }

  return (
    <Badge
      variant="outline"
      className={cn('border font-medium', variants[status])}
    >
      {t(`debt_detail.payments.status_${status}`, status)}
    </Badge>
  )
}

function isOverdue(dueDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

function currencyName(code: string, language: string): string {
  return new Intl.DisplayNames(language, { type: 'currency' }).of(code) || code
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(document.documentElement.lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
        'flex flex-col gap-3 rounded-lg border p-4',
        isStrong ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300' : 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn('mt-0.5 size-5 shrink-0', isStrong ? 'text-amber-600 dark:text-amber-400' : 'text-yellow-600 dark:text-yellow-400')} />
        <p className="text-sm">{message}</p>
      </div>
      <AyatAlDayn
        context="witness"
        className="border-0 bg-transparent p-0"
      />
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
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-300">{t('debt_detail.confirmation.banner_title')}</h3>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">
            {t('debt_detail.confirmation.banner_description', { creator: creatorName })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={processing !== null}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="size-4" />
              {processing === 'confirm'
                ? t('debt_detail.confirmation.confirming')
                : t('debt_detail.confirmation.confirm_button')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('debt_detail.confirmation.confirm_dialog_title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('debt_detail.confirmation.confirm_dialog_description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} className="bg-green-600 text-white hover:bg-green-700">
                {t('debt_detail.confirmation.confirm_dialog_confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={processing !== null}
            >
              <XCircle className="size-4" />
              {processing === 'reject'
                ? t('debt_detail.confirmation.rejecting')
                : t('debt_detail.confirmation.reject_button')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('debt_detail.confirmation.reject_dialog_title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('debt_detail.confirmation.reject_dialog_description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} variant="destructive">
                {t('debt_detail.confirmation.reject_dialog_confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function AwaitingConfirmation({ debt }: { debt: DebtData }) {
  const { t } = useTranslation()

  const confirmingPartyName = debt.creator_role === 'lender' ? (debt.borrower?.full_name ?? '') : debt.lender.full_name

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <Clock className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
        {t('debt_detail.confirmation.awaiting', { name: confirmingPartyName })}
      </p>
    </div>
  )
}

function PaymentActions({ debt, payment }: { debt: DebtData; payment: PaymentData }) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState<'approve' | 'reject' | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  function handleApprove() {
    setProcessing('approve')
    router.post(
      `/debts/${debt.id}/payments/${payment.id}/approve`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  function handleReject() {
    setProcessing('reject')
    router.post(
      `/debts/${debt.id}/payments/${payment.id}/reject`,
      { rejection_reason: rejectionReason || null },
      {
        onSuccess: () => {
          setRejectOpen(false)
          setRejectionReason('')
        },
        onFinish: () => setProcessing(null)
      }
    )
  }

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            disabled={processing !== null}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <CheckCircle className="size-3.5" />
            {processing === 'approve' ? t('debt_detail.payments.approving') : t('debt_detail.payments.approve')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('debt_detail.payments.approve_dialog_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('debt_detail.payments.approve_dialog_description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 text-white hover:bg-green-700">
              {t('debt_detail.payments.approve_dialog_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={rejectOpen}
        onOpenChange={(isOpen) => {
          setRejectOpen(isOpen)
          if (!isOpen) setRejectionReason('')
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            disabled={processing !== null}
          >
            <XCircle className="size-3.5" />
            {t('debt_detail.payments.reject')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('debt_detail.payments.reject_dialog_title')}</DialogTitle>
            <DialogDescription>{t('debt_detail.payments.reject_dialog_description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">{t('debt_detail.payments.rejection_reason_label')}</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('debt_detail.payments.rejection_reason_placeholder')}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing !== null}
            >
              {processing === 'reject' ? t('debt_detail.payments.rejecting') : t('debt_detail.payments.confirm_reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SubmitPaymentDialog({
  debt,
  installments,
  remainingBalance
}: {
  debt: DebtData
  installments: InstallmentData[]
  remainingBalance: number
}) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [installmentId, setInstallmentId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function resetForm() {
    setAmount('')
    setDescription('')
    setInstallmentId('')
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    const numAmount = parseFloat(amount)

    if (!amount || numAmount <= 0) {
      newErrors.amount = t('debt_detail.payments.amount_positive')
    } else if (numAmount > remainingBalance) {
      newErrors.amount = t('debt_detail.payments.amount_exceeds_balance', {
        remaining: remainingBalance.toLocaleString()
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    setSubmitting(true)
    router.post(
      `/debts/${debt.id}/payments`,
      {
        payment: {
          amount: parseFloat(amount),
          description: description || null,
          installment_id: installmentId && installmentId !== 'none' ? installmentId : null
        }
      },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
        onFinish: () => setSubmitting(false)
      }
    )
  }

  const upcomingInstallments = installments.filter((i) => i.status === 'upcoming' || i.status === 'overdue')

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t('debt_detail.payments.submit_payment')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('debt_detail.payments.submit_dialog_title')}</DialogTitle>
          <DialogDescription>{t('debt_detail.payments.submit_dialog_description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('debt_detail.payments.remaining_balance', {
              amount: remainingBalance.toLocaleString(),
              currency: debt.currency
            })}
          </p>
          <div className="space-y-2">
            <Label htmlFor="payment-amount">{t('debt_detail.payments.payment_amount')}</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('debt_detail.payments.payment_amount_placeholder')}
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-description">{t('debt_detail.payments.payment_description')}</Label>
            <Textarea
              id="payment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('debt_detail.payments.payment_description_placeholder')}
              rows={2}
            />
          </div>
          {upcomingInstallments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="payment-installment">{t('debt_detail.payments.link_installment')}</Label>
              <Select
                value={installmentId}
                onValueChange={setInstallmentId}
              >
                <SelectTrigger id="payment-installment">
                  <SelectValue placeholder={t('debt_detail.payments.no_installment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('debt_detail.payments.no_installment')}</SelectItem>
                  {upcomingInstallments.map((inst) => (
                    <SelectItem
                      key={inst.id}
                      value={String(inst.id)}
                    >
                      {inst.amount.toLocaleString()} {currencyName(debt.currency, i18n.language)} — {formatDate(inst.due_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t('debt_detail.payments.submitting') : t('debt_detail.payments.submit_payment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddWitnessForm({ debt, witnessCount }: { debt: DebtData; witnessCount: number }) {
  const { t } = useTranslation()
  const [personalId, setPersonalId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lookupResult, setLookupResult] = useState<{ id: number; full_name: string } | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [lookingUp, setLookingUp] = useState(false)

  const maxReached = witnessCount >= 2
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  function resetForm() {
    setPersonalId('')
    setLookupResult(null)
    setLookupError('')
  }

  useEffect(() => {
    if (personalId.length < 3) {
      setLookupResult(null)
      setLookupError('')
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setLookingUp(true)
      setLookupResult(null)
      setLookupError('')

      fetch(`/users/lookup?personal_id=${encodeURIComponent(personalId)}`)
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('not_found')
        })
        .then((data) => {
          setLookupResult(data as { id: number; full_name: string })
          setLookupError('')
        })
        .catch(() => {
          setLookupResult(null)
          setLookupError(t('debt_detail.witnesses.user_not_found'))
        })
        .finally(() => setLookingUp(false))
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [personalId, t])

  function handleInvite() {
    if (!lookupResult) return

    setSubmitting(true)
    router.post(
      `/debts/${debt.id}/witnesses`,
      { witness: { personal_id: personalId } },
      {
        onSuccess: () => resetForm(),
        onFinish: () => setSubmitting(false)
      }
    )
  }

  if (maxReached) {
    return <p className="text-sm text-muted-foreground">{t('debt_detail.witnesses.max_reached')}</p>
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <h4 className="flex items-center gap-2 text-sm font-medium">
        <UserPlus className="size-4" />
        {t('debt_detail.witnesses.add_witness')}
      </h4>
      <div className="space-y-1.5">
        <Label htmlFor="witness-personal-id">{t('debt_detail.witnesses.personal_id')}</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id="witness-personal-id"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value.toUpperCase())}
              placeholder={t('debt_detail.witnesses.personal_id_placeholder')}
              maxLength={12}
              className="font-mono uppercase ltr:pr-8 rtl:pl-8"
            />
            <div className="pointer-events-none absolute inset-y-0 flex items-center ltr:right-2.5 rtl:left-2.5">
              {lookingUp && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {!lookingUp && lookupResult && <CheckCircle className="size-4 text-green-600" />}
              {!lookingUp && lookupError && <XCircle className="size-4 text-red-600" />}
              {!lookingUp && !lookupResult && !lookupError && personalId.length < 3 && (
                <Search className="size-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <Button
            onClick={handleInvite}
            disabled={!lookupResult || submitting}
            size="sm"
          >
            {submitting ? t('debt_detail.witnesses.inviting') : t('debt_detail.witnesses.invite')}
          </Button>
        </div>
        {lookupResult && (
          <p className="text-sm text-green-700">
            {t('debt_detail.witnesses.found_user', { name: lookupResult.full_name })}
          </p>
        )}
        {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}
      </div>
    </div>
  )
}

function UpgradeDialog({ debt }: { debt: DebtData }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [personalId, setPersonalId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lookupResult, setLookupResult] = useState<{ id: number; full_name: string } | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [lookingUp, setLookingUp] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  function resetForm() {
    setPersonalId('')
    setLookupResult(null)
    setLookupError('')
  }

  useEffect(() => {
    if (personalId.length < 3) {
      setLookupResult(null)
      setLookupError('')
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setLookingUp(true)
      setLookupResult(null)
      setLookupError('')

      fetch(`/users/lookup?personal_id=${encodeURIComponent(personalId)}`)
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('not_found')
        })
        .then((data) => {
          setLookupResult(data as { id: number; full_name: string })
          setLookupError('')
        })
        .catch(() => {
          setLookupResult(null)
          setLookupError(t('debt_detail.upgrade.user_not_found'))
        })
        .finally(() => setLookingUp(false))
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [personalId, t])

  function handleUpgrade() {
    if (!lookupResult) return

    setSubmitting(true)
    router.post(
      `/debts/${debt.id}/upgrade`,
      { personal_id: personalId },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
        onFinish: () => setSubmitting(false)
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Link2 className="size-4" />
          {t('debt_detail.upgrade.link_button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('debt_detail.upgrade.dialog_title')}</DialogTitle>
          <DialogDescription>{t('debt_detail.upgrade.dialog_description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upgrade-personal-id">{t('debt_detail.upgrade.personal_id')}</Label>
            <div className="relative">
              <Input
                id="upgrade-personal-id"
                value={personalId}
                onChange={(e) => setPersonalId(e.target.value.toUpperCase())}
                placeholder={t('debt_detail.upgrade.personal_id_placeholder')}
                maxLength={12}
                className="font-mono uppercase ltr:pr-8 rtl:pl-8"
              />
              <div className="pointer-events-none absolute inset-y-0 flex items-center ltr:right-2.5 rtl:left-2.5">
                {lookingUp && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                {!lookingUp && lookupResult && <CheckCircle className="size-4 text-green-600" />}
                {!lookingUp && lookupError && <XCircle className="size-4 text-red-600" />}
                {!lookingUp && !lookupResult && !lookupError && personalId.length < 3 && (
                  <Search className="size-4 text-muted-foreground" />
                )}
              </div>
            </div>
            {lookupResult && (
              <p className="text-sm text-green-700">
                {t('debt_detail.upgrade.found_user', { name: lookupResult.full_name })}
              </p>
            )}
            {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleUpgrade}
            disabled={!lookupResult || submitting}
          >
            {submitting ? t('debt_detail.upgrade.sending') : t('debt_detail.upgrade.send_request')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UpgradeRequestBanner({ debt }: { debt: DebtData }) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState<'accept' | 'decline' | null>(null)

  const creatorName =
    debt.creator_role === 'lender' ? debt.lender.full_name : (debt.borrower?.full_name ?? debt.lender.full_name)

  function handleAccept() {
    setProcessing('accept')
    router.post(
      `/debts/${debt.id}/accept_upgrade`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  function handleDecline() {
    setProcessing('decline')
    router.post(
      `/debts/${debt.id}/decline_upgrade`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <div className="flex items-start gap-3">
        <ArrowUpCircle className="mt-0.5 size-5 shrink-0 text-purple-600 dark:text-purple-400" />
        <div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-300">{t('debt_detail.upgrade.request_title')}</h3>
          <p className="mt-1 text-sm text-purple-800 dark:text-purple-400">
            {t('debt_detail.upgrade.request_description', {
              creator: creatorName,
              amount: debt.amount.toLocaleString(),
              currency: debt.currency
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleAccept}
          disabled={processing !== null}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <CheckCircle className="size-4" />
          {processing === 'accept' ? t('debt_detail.upgrade.accepting') : t('debt_detail.upgrade.accept_button')}
        </Button>
        <Button
          variant="destructive"
          onClick={handleDecline}
          disabled={processing !== null}
        >
          <XCircle className="size-4" />
          {processing === 'decline' ? t('debt_detail.upgrade.declining') : t('debt_detail.upgrade.decline_button')}
        </Button>
      </div>
    </div>
  )
}

function AwaitingUpgrade({ name }: { name: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <Clock className="size-5 shrink-0 text-purple-600 dark:text-purple-400" />
      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">{t('debt_detail.upgrade.awaiting', { name })}</p>
    </div>
  )
}

function SettlementBanner() {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
      <div className="flex-1">
        <h3 className="font-semibold text-green-900 dark:text-green-300">{t('debt_detail.settlement.title')}</h3>
        <p className="mt-1 text-sm text-green-800 dark:text-green-400">{t('debt_detail.settlement.message')}</p>
        <AyatAlDayn
          context="settlement"
          className="mt-3"
        />
      </div>
    </div>
  )
}

function WitnessActions({ debt, witnessId }: { debt: DebtData; witnessId: number }) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState<'confirm' | 'decline' | null>(null)

  function handleConfirm() {
    setProcessing('confirm')
    router.post(
      `/debts/${debt.id}/witnesses/${witnessId}/confirm`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  function handleDecline() {
    setProcessing('decline')
    router.post(
      `/debts/${debt.id}/witnesses/${witnessId}/decline`,
      {},
      {
        onFinish: () => setProcessing(null)
      }
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleConfirm}
        disabled={processing !== null}
        className="bg-green-600 text-white hover:bg-green-700"
      >
        <CheckCircle className="size-3.5" />
        {processing === 'confirm' ? t('debt_detail.witnesses.accepting') : t('debt_detail.witnesses.accept')}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDecline}
        disabled={processing !== null}
      >
        <XCircle className="size-3.5" />
        {processing === 'decline' ? t('debt_detail.witnesses.declining') : t('debt_detail.witnesses.decline')}
      </Button>
    </div>
  )
}

export default function Show({
  debt,
  installments,
  payments,
  witnesses,
  is_confirming_party,
  is_creator,
  is_borrower,
  is_lender,
  remaining_balance,
  can_manage_witnesses,
  is_invited_witness,
  can_upgrade,
  is_upgrade_recipient,
  upgrade_recipient_name
}: ShowProps) {
  const { t, i18n } = useTranslation()

  const installmentTypeLabel = t(`debt_creation.details.installment.${debt.installment_type}`, debt.installment_type)

  return (
    <>
      <Head title={t('debt_detail.title')} />

      <div className="flex flex-col gap-6 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{t('debt_detail.title')}</h1>
          <StatusBadge status={debt.status} />
          <Badge variant="secondary">{t(`debt_detail.mode.${debt.mode}`)}</Badge>
          {debt.status === 'settled' && (
            <Badge
              variant="outline"
              className="border-muted-foreground/30 text-muted-foreground"
            >
              <Archive className="size-3 ltr:mr-1 rtl:ml-1" />
              {t('debt_detail.settlement.read_only')}
            </Badge>
          )}
        </div>

        {/* Settlement Banner */}
        {debt.status === 'settled' && <SettlementBanner />}

        {/* Confirmation Banner / Awaiting Message */}
        {debt.status === 'pending' && is_confirming_party && <ConfirmationBanner debt={debt} />}
        {debt.status === 'pending' && is_creator && !is_confirming_party && <AwaitingConfirmation debt={debt} />}

        {/* Upgrade Request (for recipient) / Awaiting Upgrade (for creator) */}
        {is_upgrade_recipient && <UpgradeRequestBanner debt={debt} />}
        {is_creator && debt.upgrade_recipient_id && !is_upgrade_recipient && upgrade_recipient_name && (
          <AwaitingUpgrade name={upgrade_recipient_name} />
        )}

        {/* Debt Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {t('debt_detail.amount')}: {debt.amount.toLocaleString()} {currencyName(debt.currency, i18n.language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.lender')}</p>
                <p className="text-sm">
                  {debt.mode === 'mutual'
                    ? debt.lender.full_name
                    : debt.creator_role === 'lender'
                      ? debt.lender.full_name
                      : (debt.counterparty_name ?? '—')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('debt_detail.borrower')}</p>
                <p className="text-sm">
                  {debt.mode === 'mutual'
                    ? (debt.borrower?.full_name ?? '—')
                    : debt.creator_role === 'borrower'
                      ? debt.lender.full_name
                      : (debt.counterparty_name ?? '—')}
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
            {debt.status !== 'settled' && (
              <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                <span className="text-sm font-medium text-muted-foreground">{t('debt_detail.remaining_balance')}</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {remaining_balance.toLocaleString(document.documentElement.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyName(debt.currency, i18n.language)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade to Mutual */}
        {can_upgrade && <UpgradeDialog debt={debt} />}

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
                            ? 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300'
                            : ''
                        )}
                      >
                        <td className="py-2.5">
                          {inst.amount.toLocaleString()} {currencyName(debt.currency, i18n.language)}
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
                    <div className="flex items-center gap-2">
                      {witness.status === 'invited' && is_invited_witness === witness.id ? (
                        <WitnessActions
                          debt={debt}
                          witnessId={witness.id}
                        />
                      ) : (
                        <StatusBadge status={witness.status} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {can_manage_witnesses && (
              <AddWitnessForm
                debt={debt}
                witnessCount={witnesses.length}
              />
            )}
            {debt.status !== 'settled' && (
              <WitnessReminder
                mode={debt.mode}
                witnesses={witnesses}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                {t('debt_detail.payments.title')}
              </CardTitle>
              {debt.status === 'active' && is_borrower && remaining_balance > 0 && (
                <SubmitPaymentDialog
                  debt={debt}
                  installments={installments}
                  remainingBalance={remaining_balance}
                />
              )}
            </div>
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
                        {payment.amount.toLocaleString()} {currencyName(debt.currency, i18n.language)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {payment.self_reported && (
                          <Badge
                            variant="outline"
                            className="border-orange-200 bg-orange-50 text-xs text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            {t('debt_detail.payments.self_reported')}
                          </Badge>
                        )}
                        <PaymentStatusBadge status={payment.status} />
                      </div>
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
                    {payment.status === 'pending' &&
                      is_lender &&
                      debt.mode === 'mutual' &&
                      debt.status !== 'settled' && (
                        <PaymentActions
                          debt={debt}
                          payment={payment}
                        />
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ayat al-Dayn Banner */}
        <AyatAlDayn context="detail" />
      </div>
    </>
  )
}

Show.layout = [AppLayout]
