'use client'

import React, { useEffect, useState } from 'react'

import { AuthModal } from '@/components/modals/auth-modal'
import { CoverImageModal } from '@/components/modals/cover-image-modal'
import { SettingsModal } from '@/components/modals/settings-modal'

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <SettingsModal />
      <CoverImageModal />
      <AuthModal />
    </>
  )
}
