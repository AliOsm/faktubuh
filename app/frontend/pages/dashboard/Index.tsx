import { Head, Link } from '@inertiajs/react'
import { ArrowRight, Calendar, CreditCard, HandCoins, HandHeart, Plus, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import AyatAlDayn from '@/components/ayat-al-dayn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'

interface CurrencySummary {
  currency: string
  total_lent: number
  total_borrowed: number
  total_paid: number
  remaining: number
  next_installment_date: string | null
  next_installment_amount: number | null
  active_count: number
  settled_count: number
}

interface RecentDebt {
  id: number
  counterparty_name: string
  amount: number
  currency: string
  status: string
  mode: string
  created_at: string
}

interface DashboardProps {
  summaries: CurrencySummary[]
  recent_debts: RecentDebt[]
}

function formatCurrency(amount: number, currency: string): string {
  return `${amount.toLocaleString(document.documentElement.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(document.documentElement.lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    active: 'default',
    settled: 'secondary'
  }

  return <Badge variant={variants[status] || 'outline'}>{t(`dashboard.status.${status}`)}</Badge>
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{t('dashboard.empty_title')}</CardTitle>
          <CardDescription className="text-base">{t('dashboard.empty_description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <AyatAlDayn context="welcome" />
          <Button
            asChild
            size="lg"
          >
            <Link href="/debts/new">
              <Plus className="size-4" />
              {t('dashboard.empty_cta')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CurrencySummaryCard({ summary, t }: { summary: CurrencySummary; t: (key: string) => string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold">{summary.currency}</span>
          <div className="flex gap-2 text-sm font-normal text-muted-foreground">
            <span>
              {summary.active_count} {t('dashboard.active_debts')}
            </span>
            <span>/</span>
            <span>
              {summary.settled_count} {t('dashboard.settled_debts')}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <HandCoins className="mt-0.5 size-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.total_lent')}</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(summary.total_lent, summary.currency)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HandHeart className="mt-0.5 size-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.total_borrowed')}</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(summary.total_borrowed, summary.currency)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.total_paid')}</p>
              <p className="font-semibold">{formatCurrency(summary.total_paid, summary.currency)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 size-4 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.remaining')}</p>
              <p className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(summary.remaining, summary.currency)}</p>
            </div>
          </div>
        </div>

        {summary.next_installment_date && summary.next_installment_amount != null ? (
          <div className="mt-4 flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('dashboard.next_installment')}:</span>
            <span className="font-medium">{formatCurrency(summary.next_installment_amount, summary.currency)}</span>
            <span className="text-muted-foreground">{formatDate(summary.next_installment_date)}</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            {t('dashboard.no_upcoming')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentDebtRow({ debt, t }: { debt: RecentDebt; t: (key: string) => string }) {
  return (
    <Link
      href={`/debts/${debt.id}`}
      className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium">{debt.counterparty_name}</span>
        <span className="text-sm text-muted-foreground">{formatCurrency(debt.amount, debt.currency)}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge
          status={debt.status}
          t={t}
        />
        <ArrowRight className="size-4 text-muted-foreground rtl:rotate-180" />
      </div>
    </Link>
  )
}

function Dashboard({ summaries, recent_debts }: DashboardProps) {
  const { t } = useTranslation()

  const hasDebts = summaries.length > 0 || recent_debts.length > 0

  if (!hasDebts) {
    return (
      <>
        <Head title={t('dashboard.title')} />
        <EmptyState t={t} />
      </>
    )
  }

  return (
    <>
      <Head title={t('dashboard.title')} />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <Button asChild>
            <Link href="/debts/new">
              <Plus className="size-4" />
              {t('dashboard.new_debt')}
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {summaries.map((summary) => (
            <CurrencySummaryCard
              key={summary.currency}
              summary={summary}
              t={t}
            />
          ))}
        </div>

        {recent_debts.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>{t('dashboard.recent_debts')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href="/debts">
                  {t('dashboard.view_all')}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {recent_debts.map((debt) => (
                <RecentDebtRow
                  key={debt.id}
                  debt={debt}
                  t={t}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

Dashboard.layout = [AppLayout]

export default Dashboard
