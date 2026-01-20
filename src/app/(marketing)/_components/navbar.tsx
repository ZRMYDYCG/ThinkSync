'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { LanguageToggle } from '@/components/language-toggle'
import { ModeToggle } from '@/components/mode-toggle'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { useScrollTop } from '@/hooks/useScrollTop'
import { cn } from '@/lib/utils'

import Logo from './logo'

const Navbar = () => {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const { onOpen } = useAuthModal()
  const scrolled = useScrollTop()
  const t = useTranslations('Route.marketing.navbar')

  return (
    <div
      className={cn(
        'z-50 bg-background fixed top-0 flex items-center w-full p-6',
        scrolled && 'border-b shadow-sm',
      )}
    >
      <Logo />
      <div className="flex w-full items-center justify-between gap-x-2 md:ml-auto md:justify-end">
        {isLoading && <Spinner></Spinner>}
        {!isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onOpen('login')}>
              {t('login')}
            </Button>
            <Button size="sm" onClick={() => onOpen('register')}>
              {t('getStarted')}
            </Button>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">{t('enterApp')}</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              {t('logout')}
            </Button>
          </>
        )}
        <ModeToggle />
        <LanguageToggle />
      </div>
    </div>
  )
}

export default Navbar
