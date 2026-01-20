'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { SearchCommand } from '@/components/search-command'
import { Spinner } from '@/components/spinner'
import { useAuth } from '@/hooks/use-auth'

import Navigation from './_components/navigation'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-full w-full dark:bg-[#1F1F1F]">
      <Navigation></Navigation>
      <SearchCommand></SearchCommand>
      <main className="h-full flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

export default MainLayout
