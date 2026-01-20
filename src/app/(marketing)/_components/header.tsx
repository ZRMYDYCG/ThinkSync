'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const Header = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const t = useTranslations('Route.marketing.header')

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl">
        {t('title')}
        <span className="underline">{t('brandName')}</span>
      </h1>
      <h3 className="text-base font-medium sm:text-xl md:text-2xl">{t('subtitle')}</h3>
      {isLoading && (
        <div className="flex w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/documents">
            {t('enterButton')}
            <ArrowRight className="ml-2 h-4 w-4"></ArrowRight>
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/register">
            {t('getStartedButton')}
            <ArrowRight className="ml-2 h-4 w-4"></ArrowRight>
          </Link>
        </Button>
      )}
    </div>
  )
}

export default Header
