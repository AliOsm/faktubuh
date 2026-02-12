import { Head, Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import DarkModeToggle from '@/components/dark-mode-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignIn() {
  const { t } = useTranslation()
  const { flash } = usePage().props as {
    flash?: { notice?: string; alert?: string }
  }

  const form = useForm({
    user: {
      email: '',
      password: '',
      remember_me: false
    }
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    form.post('/users/sign_in')
  }

  return (
    <>
      <Head title={t('auth.sign_in.title')} />

      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="fixed top-4 end-4 flex gap-1">
          <LanguageToggle />
          <DarkModeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.sign_in.title')}</CardTitle>
            <CardDescription>{t('auth.sign_in.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {flash?.alert && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{flash.alert}</div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t('auth.sign_in.email')}</Label>
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
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t('auth.sign_in.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.data.user.password}
                  onChange={(e) =>
                    form.setData('user', {
                      ...form.data.user,
                      password: e.target.value
                    })
                  }
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember_me"
                  type="checkbox"
                  checked={form.data.user.remember_me}
                  onChange={(e) =>
                    form.setData('user', {
                      ...form.data.user,
                      remember_me: e.target.checked
                    })
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <Label
                  htmlFor="remember_me"
                  className="text-sm font-normal"
                >
                  {t('auth.sign_in.remember_me')}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.processing}
              >
                {form.processing ? t('auth.sign_in.signing_in') : t('auth.sign_in.submit')}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
              </div>
            </div>

            <form
              action="/users/auth/google_oauth2"
              method="post"
            >
              <input
                type="hidden"
                name="authenticity_token"
                value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''}
              />
              <Button
                type="submit"
                variant="outline"
                className="w-full"
              >
                <svg
                  className="me-2 h-4 w-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t('auth.google_sign_in')}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('auth.sign_in.no_account')}{' '}
              <Link
                href="/users/sign_up"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t('auth.sign_in.sign_up_link')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
