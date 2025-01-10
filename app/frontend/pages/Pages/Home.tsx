import lightLogo from '@/assets/logo-light.svg'
import darkLogo from '@/assets/logo-dark.svg'
import SigninWithGoogleButton from '@/components/signin-with-google-button'
import Layout from "@/components/layout"
import { Head, usePage } from "@inertiajs/react"
import { ReactTyped } from "react-typed"

export default function Home() {
  const { current_user } = usePage().props

  return (
    <Layout>
      <Head title="فاكتبوه." />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col w-full items-center justify-center p-8">
          <div className="relative size-48 sm:size-64 lg:size-96">
            <img className='dark:hidden block' src={lightLogo} />
            <img className='dark:block hidden' src={darkLogo} />
          </div>

          <h1 className="max-w-3xl font-['Amiri'] text-right text-3xl sm:text-2xl md:text-3xl lg:text-4xl leading-loose sm:leading-relaxed md:leading-relaxed lg:leading-relaxed">
            <span className='text-muted-foreground'>يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى</span>

            <ReactTyped
              strings={["&nbsp;فَاكْتُبُوه."]}
              startDelay={150}
              typeSpeed={75}
            />
          </h1>

          <p className="mt-2 mb-6 text-muted-foreground">
            البقرة - 282
          </p>

          {!current_user && (<SigninWithGoogleButton />)}
        </div>
      </div>
    </Layout>
  )
}
