'use client'

import Link from 'next/link'
import React from 'react'

import { LanguageToggle } from '@/components/language-toggle'
import { ModeToggle } from '@/components/mode-toggle'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useScrollTop } from '@/hooks/useScrollTop'
import { cn } from '@/lib/utils'

import Logo from './logo'

const Navbar = () => {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const scrolled = useScrollTop()

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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get ThinkSync Free</Link>
            </Button>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">Enter ThinkSync</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
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
