import type { ResolvedComponent } from '@inertiajs/react'
import { createInertiaApp } from '@inertiajs/react'
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import { DirectionProvider } from '@/components/ui/direction'
import i18n from '@/i18n/config'
import PersistentLayout from '@/layouts/persistent-layout'

function DirectionWrapper({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  return <DirectionProvider dir={i18n.dir()}>{children}</DirectionProvider>
}

const appName = import.meta.env.VITE_APP_NAME ?? 'Faktubuh'

void createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),

  resolve: (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>('../pages/**/*.tsx', {
      eager: true
    })
    const page = pages[`../pages/${name}.tsx`]
    if (!page) {
      console.error(`Missing Inertia page component: '${name}.tsx'`)
    }

    const existing = page.default.layout
    if (Array.isArray(existing)) {
      if (existing[0] !== PersistentLayout) {
        page.default.layout = [PersistentLayout, ...existing]
      }
    } else {
      page.default.layout = [PersistentLayout]
    }

    return page
  },

  setup({ el, App, props }) {
    const locale = (props.initialPage.props.locale as string | undefined) ?? 'ar'
    i18n.changeLanguage(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

    createRoot(el).render(
      <StrictMode>
        <DirectionWrapper>
          <App {...props} />
        </DirectionWrapper>
      </StrictMode>
    )
  },

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false
    },
    future: {
      useScriptElementForInitialPage: true,
      useDataInertiaHeadAttribute: true,
      useDialogForErrorModal: true,
      preserveEqualProps: true
    }
  },

  progress: {
    color: '#4B5563'
  }
}).catch((error) => {
  if (document.getElementById('app')) {
    throw error
  } else {
    console.error(
      'Missing root element.\n\n' +
        'If you see this error, it probably means you loaded Inertia.js on non-Inertia pages.\n' +
        'Consider moving <%= vite_typescript_tag "inertia" %> to the Inertia-specific layout instead.'
    )
  }
})
