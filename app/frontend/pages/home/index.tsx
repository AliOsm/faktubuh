import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'

function Home() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl">{t('home.title')}</CardTitle>
          <CardDescription>{t('home.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t('home.description')}</p>
          <Button>{t('home.get_started')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}

Home.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>

export default Home
