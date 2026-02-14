import { Head, Link, router } from '@inertiajs/react'
import { Archive, ArrowRight, Filter, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { cn } from '@/lib/utils'

interface DebtRow {
  id: number
  counterparty_name: string
  amount: number
  currency: string
  status: 'pending' | 'active' | 'settled' | 'rejected'
  mode: 'mutual' | 'personal'
  deadline: string
  progress: number
}

interface Filters {
  status: string
  mode: string
  role: string
  sort: string
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

interface IndexProps {
  debts: DebtRow[]
  pagination: PaginationMeta
  filters: Filters
  [key: string]: unknown
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()

  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    active: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    settled: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    rejected: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
  }

  return (
    <Badge
      variant="outline"
      className={cn('border font-medium', variants[status])}
    >
      {t(`debts_list.status.${status}`, status)}
    </Badge>
  )
}

function ModeBadge({ mode }: { mode: string }) {
  const { t } = useTranslation()
  return <Badge variant="secondary">{t(`debts_list.mode.${mode}`, mode)}</Badge>
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full rounded-full transition-all',
          progress >= 100 ? 'bg-green-500' : progress > 0 ? 'bg-primary' : 'bg-muted'
        )}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(document.documentElement.lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function updateFilters(key: string, value: string) {
  const url = new URL(window.location.href)
  if (value === 'all' || value === 'created_at_desc') {
    url.searchParams.delete(key)
  } else {
    url.searchParams.set(key, value)
  }
  router.get(url.pathname + url.search, {}, { preserveState: true, replace: true })
}

export default function Index({ debts, pagination, filters }: IndexProps) {
  const { t } = useTranslation()

  return (
    <>
      <Head title={t('debts_list.title')} />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('debts_list.title')}</h1>
          <Button asChild>
            <Link href="/debts/new">
              <Plus className="size-4" />
              {t('debts_list.new_debt')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select
              value={filters.status}
              onValueChange={(v) => updateFilters('status', v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('debts_list.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('debts_list.filters.all_statuses')}</SelectItem>
                <SelectItem value="pending">{t('debts_list.status.pending')}</SelectItem>
                <SelectItem value="active">{t('debts_list.status.active')}</SelectItem>
                <SelectItem value="settled">{t('debts_list.status.settled')}</SelectItem>
                <SelectItem value="rejected">{t('debts_list.status.rejected')}</SelectItem>
              </SelectContent>
            </Select>

<Select
              value={filters.mode}
              onValueChange={(v) => updateFilters('mode', v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('debts_list.filters.mode')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('debts_list.filters.all_modes')}</SelectItem>
                <SelectItem value="mutual">{t('debts_list.mode.mutual')}</SelectItem>
                <SelectItem value="personal">{t('debts_list.mode.personal')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.role}
              onValueChange={(v) => updateFilters('role', v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('debts_list.filters.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('debts_list.filters.all_roles')}</SelectItem>
                <SelectItem value="lender">{t('debts_list.filters.lender')}</SelectItem>
                <SelectItem value="borrower">{t('debts_list.filters.borrower')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sort}
              onValueChange={(v) => updateFilters('sort', v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('debts_list.sort.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">{t('debts_list.sort.newest')}</SelectItem>
                <SelectItem value="deadline_asc">{t('debts_list.sort.deadline')}</SelectItem>
                <SelectItem value="amount_desc">{t('debts_list.sort.amount')}</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Debts List */}
        {debts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <p className="text-muted-foreground">{t('debts_list.empty')}</p>
              <Button
                variant="outline"
                asChild
              >
                <Link href="/debts/new">
                  <Plus className="size-4" />
                  {t('debts_list.new_debt')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
          <Card>
            <CardHeader>
              <CardTitle>{t('debts_list.showing', { count: debts.length })}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {debts.map((debt) => (
                <Link
                  key={debt.id}
                  href={`/debts/${debt.id}`}
                  className={cn(
                    'flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-accent',
                    debt.status === 'settled' && 'border-muted bg-muted/30 opacity-75'
                  )}
                >
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate font-medium', debt.status === 'settled' && 'text-muted-foreground')}>
                        {debt.status === 'settled' && (
                          <Archive className="mb-0.5 inline-block size-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                        )}
                        {debt.counterparty_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {debt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                        {debt.currency}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={debt.status} />
                      <ModeBadge mode={debt.mode} />
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(debt.deadline)}</p>
                    <div className="w-24 shrink-0">
                      <ProgressBar progress={debt.progress} />
                      <p className="mt-0.5 text-center text-xs text-muted-foreground">{debt.progress}%</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground ltr:ml-3 rtl:mr-3 rtl:rotate-180" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Pagination pagination={pagination} />
          </>
        )}
      </div>
    </>
  )
}

Index.layout = [AppLayout]
