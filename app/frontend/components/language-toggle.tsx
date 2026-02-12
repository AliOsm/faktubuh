import { router } from '@inertiajs/react'
import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function LanguageToggle() {
  const { i18n, t } = useTranslation()

  function switchLocale(locale: string) {
    if (locale === i18n.language) return

    i18n.changeLanguage(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`

    router.reload({ data: { locale } })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <Languages className="size-4" />
          <span className="sr-only">{t('language.toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale('en')}>
          {i18n.language === 'en' && <Check className="size-4" />}
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('ar')}>
          {i18n.language === 'ar' && <Check className="size-4" />}
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
