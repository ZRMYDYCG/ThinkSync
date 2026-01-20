'use client'

import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React from 'react'

import ConfirmModal from '@/components/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoverImage } from '@/hooks/use-cover-image'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { cn } from '@/lib/utils'

interface CoverProps {
  url?: string
  preview?: boolean
}

const Cover = ({ url, preview }: CoverProps) => {
  const params = useParams()
  const coverImage = useCoverImage()
  const { removeCover } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'
  const coverUrl = (() => {
    if (!url) return undefined
    const normalized = url.replace(/\\/g, '/')
    if (
      /^https?:\/\//i.test(normalized) ||
      normalized.startsWith('data:') ||
      normalized.startsWith('blob:')
    ) {
      return normalized
    }
    const pathname = normalized.startsWith('/') ? normalized : `/${normalized}`
    try {
      return new URL(pathname, apiBaseUrl).toString()
    } catch {
      return pathname
    }
  })()

  const onRemove = async () => {
    if (!params.documentId) return
    await removeCover(params.documentId as string)
    bump()
  }

  return (
    <div className={cn('relative w-full h-[35vh] group', !url && 'h-[12vh]', url && 'bg-muted')}>
      {!!coverUrl && <Image src={coverUrl} fill className="object-cover" alt="Cover" />}
      {url && !preview && (
        <div className="absolute bottom-5 right-5 flex items-center gap-x-2 opacity-0 group-hover:opacity-100">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-xs text-muted-foreground"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Change Cover
          </Button>
          <ConfirmModal onConfirm={onRemove}>
            <Button className="text-xs text-muted-foreground" variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Remove Cover
            </Button>
          </ConfirmModal>
        </div>
      )}
    </div>
  )
}

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="bg-skeleton h-[12vh] w-full" />
}

export default Cover
