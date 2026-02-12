import { Head, Link } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'

import DarkModeToggle from '@/components/dark-mode-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Head title={t('home.title')} />

      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
        <div className="fixed top-4 end-4 flex gap-1">
          <LanguageToggle />
          <DarkModeToggle />
        </div>

        <div className="flex max-w-lg flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t('app.name')}</h1>
          <p className="text-xl text-muted-foreground">{t('home.subtitle')}</p>
          <p className="text-sm text-muted-foreground">{t('home.description')}</p>

          <blockquote className="border-s-4 border-primary/30 ps-4 text-end">
            <p className="text-lg leading-relaxed">{t('ayat.welcome.verse')}</p>
            {i18n.language !== 'ar' && (
              <p className="mt-2 text-sm text-muted-foreground">{t('ayat.welcome.translation')}</p>
            )}
            <footer className="mt-1 text-xs text-muted-foreground">{t('ayat.welcome.reference')}</footer>
          </blockquote>

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/users/sign_up">{t('auth.sign_up.title')}</Link>
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href="/users/sign_in">{t('auth.sign_in.title')}</Link>
            </Button>
          </div>
        </div>

        <Link
          href="/privacy"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t('privacy.title')}
        </Link>
      </div>
    </>
  )
}
