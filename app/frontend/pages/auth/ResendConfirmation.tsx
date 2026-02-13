import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import DarkModeToggle from '@/components/dark-mode-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResendConfirmation() {
  const { t } = useTranslation()

  const form = useForm({
    user: {
      email: ''
    }
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    form.post('/users/confirmation')
  }

  return (
    <>
      <Head title={t('auth.resend_confirmation.title')} />

      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="fixed top-4 end-4 flex gap-1">
          <LanguageToggle />
          <DarkModeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.resend_confirmation.title')}</CardTitle>
            <CardDescription>{t('auth.resend_confirmation.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t('auth.resend_confirmation.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.data.user.email}
                  onChange={(e) =>
                    form.setData('user', {
                      ...form.data.user,
                      email: e.target.value
                    })
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.processing}
              >
                {form.processing ? t('auth.resend_confirmation.sending') : t('auth.resend_confirmation.submit')}
              </Button>
            </form>

            <Link
              href="/users/sign_in"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('auth.resend_confirmation.back_to_sign_in')}
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
