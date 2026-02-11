import { Head, Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

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
        <div className="fixed top-4 end-4">
          <LanguageToggle />
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
