import { Head, router } from '@inertiajs/react'
import { Bell, BellOff, Check, CheckCheck, CreditCard, FileText, HandCoins, Shield, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'

interface NotificationData {
  id: number
  notification_type: string
  message: string
  read: boolean
  debt_id: number | null
  created_at: string
}

interface IndexProps {
  notifications: NotificationData[]
  [key: string]: unknown
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  debt_created: <FileText className="size-5 text-blue-600 dark:text-blue-400" />,
  debt_confirmed: <CheckCheck className="size-5 text-green-600 dark:text-green-400" />,
  debt_rejected: <XCircle className="size-5 text-red-600 dark:text-red-400" />,
  payment_submitted: <CreditCard className="size-5 text-yellow-600 dark:text-yellow-400" />,
  payment_approved: <CreditCard className="size-5 text-green-600 dark:text-green-400" />,
  payment_rejected: <CreditCard className="size-5 text-red-600 dark:text-red-400" />,
  witness_invited: <Shield className="size-5 text-blue-600 dark:text-blue-400" />,
  witness_confirmed: <Shield className="size-5 text-green-600 dark:text-green-400" />,
  witness_declined: <Shield className="size-5 text-red-600 dark:text-red-400" />,
  debt_settled: <HandCoins className="size-5 text-emerald-600 dark:text-emerald-400" />
}

function getNotificationIcon(type: string): React.ReactNode {
  return NOTIFICATION_ICONS[type] ?? <Bell className="size-5 text-muted-foreground" />
}

function formatRelativeTime(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffDays > 0) return rtf.format(-diffDays, 'day')
  if (diffHours > 0) return rtf.format(-diffHours, 'hour')
  if (diffMinutes > 0) return rtf.format(-diffMinutes, 'minute')
  return rtf.format(-diffSeconds, 'second')
}

function NotificationItem({ notification, locale }: { notification: NotificationData; locale: string }) {
  const { t } = useTranslation()

  function handleClick() {
    router.post(
      `/notifications/${notification.id}/mark_read`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          if (notification.debt_id) {
            router.visit(`/debts/${notification.debt_id}`)
          }
        }
      }
    )
  }

  function handleMarkRead(e: React.MouseEvent) {
    e.stopPropagation()
    router.post(`/notifications/${notification.id}/mark_read`, {}, { preserveScroll: true })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-start gap-3 rounded-lg border p-4 text-start transition-colors hover:bg-accent/50"
      style={{ fontWeight: notification.read ? 'normal' : undefined }}
    >
      <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.notification_type)}</div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(notification.created_at, locale)}</p>
      </div>
      {!notification.read && (
        <button
          type="button"
          onClick={handleMarkRead}
          className="mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={t('notifications_page.mark_read')}
        >
          <Check className="size-4" />
        </button>
      )}
    </button>
  )
}

export default function Index({ notifications }: IndexProps) {
  const { t, i18n } = useTranslation()

  const hasUnread = notifications.some((n) => !n.read)

  function handleMarkAllRead() {
    router.post('/notifications/mark_all_read', {}, { preserveScroll: true })
  }

  return (
    <>
      <Head title={t('notifications_page.title')} />

      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('notifications_page.title')}</h1>
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-4 ltr:mr-2 rtl:ml-2" />
              {t('notifications_page.mark_all_read')}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <BellOff className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t('notifications_page.empty')}</p>
              <p className="max-w-sm text-center text-xs text-muted-foreground/70">{t('notifications_page.empty_description')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                locale={i18n.language}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

Index.layout = [AppLayout]
