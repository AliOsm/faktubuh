import { router } from '@inertiajs/react'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export default function LanguageToggle() {
  const { i18n, t } = useTranslation()

  function switchLocale() {
    const newLocale = i18n.language === 'ar' ? 'en' : 'ar'

    i18n.changeLanguage(newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'

    document.cookie = `locale=${newLocale};path=/;max-age=${365 * 24 * 60 * 60}`

    router.reload({ data: { locale: newLocale } })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
    >
      <Languages className="size-4" />
      <span>{t('language.toggle')}</span>
    </Button>
  )
}
