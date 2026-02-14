import { router, usePage } from '@inertiajs/react'
import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { SharedData } from '@/types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const { auth } = usePage<SharedData>().props

  function switchLocale(locale: string) {
    if (locale === i18n.language) return

    document.body.style.transition = 'opacity 150ms ease-out'
    document.body.style.opacity = '0'

    const fadeIn = () => {
      document.body.style.opacity = '1'
      setTimeout(() => {
        document.body.style.transition = ''
      }, 150)
    }

    setTimeout(() => {
      i18n.changeLanguage(locale)
      document.documentElement.lang = locale
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

      document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`

      if (auth) {
        // Persist locale to database for authenticated users
        router.put('/profile', { user: { locale } }, {
          preserveScroll: true,
          preserveState: true,
          only: [],
          onFinish: () => {
            router.reload({
              data: { locale },
              onFinish: fadeIn
            })
          }
        })
      } else {
        router.reload({
          data: { locale },
          onFinish: fadeIn
        })
      }
    }, 150)
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
        <DropdownMenuItem onClick={() => switchLocale('ar')} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">🇸🇦</span>
            <span lang="ar">العربية</span>
          </span>
          {i18n.language === 'ar' && <Check className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('en')} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">🇺🇸</span>
            English
          </span>
          {i18n.language === 'en' && <Check className="size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
