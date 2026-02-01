'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/components/ui/button'
import { useShareModal } from '@/hooks/use-share-modal'

interface CollabButtonProps {
  preview?: boolean
  isActive?: boolean
  collaboratorCount?: number
}

export const CollabButton = ({
  preview,
  isActive = false,
  collaboratorCount = 0,
}: CollabButtonProps) => {
  const t = useTranslations('App.toolbar')
  const shareModal = useShareModal()

  if (preview) {
    return null
  }

  const handleClick = () => {
    shareModal.onOpen()
  }

  return (
    <Button
      onClick={handleClick}
      className="text-muted-foreground text-xs"
      variant={isActive ? 'default' : 'outline'}
      size="sm"
    >
      <Users className="mr-2 h-4 w-4" />
      {t('collaborate')}
      {collaboratorCount > 0 && (
        <span className="bg-background/50 ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]">
          {collaboratorCount}
        </span>
      )}
    </Button>
  )
}
