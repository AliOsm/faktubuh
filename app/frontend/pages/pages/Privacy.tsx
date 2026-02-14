import { Head, Link } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'

import DarkModeToggle from '@/components/dark-mode-toggle'
import LanguageToggle from '@/components/language-toggle'
import { GeometricPattern } from '@/components/patterns/GeometricPattern'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function Privacy() {
  const { t } = useTranslation()

  return (
    <>
      <Head title={t('privacy.title')} />

      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <GeometricPattern variant="grid" opacity={0.015} />

        <Link href="/" className="fixed top-4 start-4 text-xl font-bold hover:opacity-80 transition-opacity z-10">
          {t('app.name')}
        </Link>

        <div className="fixed top-4 end-4 flex items-center gap-1 z-10">
          <LanguageToggle />
          <DarkModeToggle />
        </div>

        <Card className="relative z-10 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold">Introduction</h3>
              <p className="text-muted-foreground">
                Faktubuh ("we", "our", "us") is a peer-to-peer Islamic debt tracking application. This
                privacy policy explains how we collect, use, and protect your information when you use our
                service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Information We Collect</h3>
              <p className="text-muted-foreground">
                When you sign in with Google, we receive and store the following information from your Google
                account:
              </p>
              <ul className="list-disc space-y-1 ps-6 text-muted-foreground">
                <li>Your name</li>
                <li>Your email address</li>
              </ul>
              <p className="text-muted-foreground">
                We also store data you create within the application, such as debt records, payment
                information, and witness assignments.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">How We Use Your Information</h3>
              <p className="text-muted-foreground">Your information is used solely to:</p>
              <ul className="list-disc space-y-1 ps-6 text-muted-foreground">
                <li>Authenticate your identity and provide access to your account</li>
                <li>Display your name to other users you interact with on the platform</li>
                <li>Send you notifications related to your debt activity</li>
                <li>Operate and maintain the service</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Data Sharing</h3>
              <p className="text-muted-foreground">
                We do not sell, trade, or share your personal information with third parties. Your data is
                only visible to users you directly interact with through debt records and witness
                assignments.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information. All data is
                transmitted over encrypted connections (HTTPS).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Data Retention</h3>
              <p className="text-muted-foreground">
                Your account data is retained for as long as your account is active. You may request
                deletion of your account and associated data by contacting us.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Changes to This Policy</h3>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. Any changes will be reflected on this
                page with an updated revision date.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Contact</h3>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy or your data, please contact us at{' '}
                <a
                  href="mailto:faktubuh@gmail.com"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  faktubuh@gmail.com
                </a>
                .
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default Privacy
