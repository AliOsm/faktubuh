import { Head, Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import LanguageToggle from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUp() {
  const { t } = useTranslation()
  const { errors: pageErrors } = usePage().props as { errors?: Record<string, string> }

  const form = useForm({
    user: {
      full_name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
  })

  const errors = pageErrors ?? {}

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    form.post('/users')
  }

  return (
    <>
      <Head title={t('auth.sign_up.title')} />

      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="fixed top-4 end-4">
          <LanguageToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.sign_up.title')}</CardTitle>
            <CardDescription>{t('auth.sign_up.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">{t('auth.sign_up.full_name')}</Label>
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
                <Label htmlFor="email">{t('auth.sign_up.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.data.user.email}
                  onChange={(e) => form.setData('user', { ...form.data.user, email: e.target.value })}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t('auth.sign_up.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.data.user.password}
                  onChange={(e) => form.setData('user', { ...form.data.user, password: e.target.value })}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password_confirmation">{t('auth.sign_up.password_confirmation')}</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={form.data.user.password_confirmation}
                  onChange={(e) =>
                    form.setData('user', {
                      ...form.data.user,
                      password_confirmation: e.target.value
                    })
                  }
                  autoComplete="new-password"
                  aria-invalid={!!errors.password_confirmation}
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.processing}
              >
                {form.processing ? t('auth.sign_up.signing_up') : t('auth.sign_up.submit')}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('auth.sign_up.have_account')}{' '}
              <Link
                href="/users/sign_in"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t('auth.sign_up.sign_in_link')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
