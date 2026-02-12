import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { ArrowLeft, Mail } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import DarkModeToggle from '@/components/dark-mode-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUp() {
  const { t } = useTranslation()
  const { errors: pageErrors } = usePage().props as { errors?: Record<string, string> }
  const [showEmailForm, setShowEmailForm] = useState(false)

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
        <div className="fixed top-4 end-4 flex gap-1">
          <LanguageToggle />
          <DarkModeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.sign_up.title')}</CardTitle>
            <CardDescription>{t('auth.sign_up.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social login */}
            <div
              className="grid transition-all duration-200 ease-out motion-reduce:transition-none"
              style={{
                gridTemplateRows: showEmailForm ? '0fr' : '1fr',
                opacity: showEmailForm ? 0 : 1,
                pointerEvents: showEmailForm ? 'none' : 'auto',
              }}
            >
              <div className="overflow-hidden">
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
                    {t('auth.google_sign_up')}
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

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail className="me-2 h-4 w-4" />
                  {t('auth.continue_with_email')}
                </Button>
              </div>
            </div>

            {/* Email form */}
            <div
              className="grid transition-all duration-200 ease-out motion-reduce:transition-none"
              style={{
                gridTemplateRows: showEmailForm ? '1fr' : '0fr',
                opacity: showEmailForm ? 1 : 0,
                pointerEvents: showEmailForm ? 'auto' : 'none',
              }}
            >
              <div className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  {t('common.back')}
                </button>

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
              </div>
            </div>

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
