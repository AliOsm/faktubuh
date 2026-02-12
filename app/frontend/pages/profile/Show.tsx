import { Head, useForm, usePage } from '@inertiajs/react'
import { Check, Copy, Share2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'


interface ProfileProps {
  user: {
    id: number
    full_name: string
    email: string
    personal_id: string
    locale: string
    created_at: string
  }
  [key: string]: unknown
}

export default function Show({ user }: ProfileProps) {
  const { t } = useTranslation()
  const { errors: pageErrors } = usePage().props as { errors?: Record<string, string> }
  const [copied, setCopied] = useState(false)

  const form = useForm({
    user: {
      full_name: user.full_name
    }
  })

  const errors = pageErrors ?? {}

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    form.patch('/profile')
  }

  function handleCopy() {
    navigator.clipboard.writeText(user.personal_id).then(() => {
      setCopied(true)
      toast.success(t('profile.id_copied'))
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: t('profile.share_title'),
        text: t('profile.share_text', { personal_id: user.personal_id })
      })
    } else {
      handleCopy()
    }
  }

  return (
    <>
      <Head title={t('profile.title')} />

      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personal_id')}</CardTitle>
            <CardDescription>{t('profile.personal_id_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold tracking-widest">{user.personal_id}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label={t('profile.copy_id')}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                aria-label={t('profile.share_id')}
              >
                <Share2 className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personal_info')}</CardTitle>
            <CardDescription>{t('profile.personal_info_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">{t('profile.full_name')}</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={form.data.user.full_name}
                  onChange={(e) => form.setData('user', { ...form.data.user, full_name: e.target.value })}
                  autoComplete="name"
                  aria-invalid={!!errors.full_name}
                />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={form.processing}
                >
                  {form.processing ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>
