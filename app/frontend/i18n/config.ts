import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ar from '@/i18n/locales/ar.json'
import en from '@/i18n/locales/en.json'

const resources = {
  en: { translation: en },
  ar: { translation: ar }
} as const

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
