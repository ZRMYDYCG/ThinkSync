'use client'

import { ImageIcon, MoveVertical, X } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import ConfirmModal from '@/components/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoverImage } from '@/hooks/use-cover-image'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { cn } from '@/lib/utils'

interface CoverProps {
  url?: string
  position?: number | null
  preview?: boolean
}

const DEFAULT_COVER_POSITION = 50

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const normalizeCoverPosition = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_COVER_POSITION
  }
  return clamp(value, 0, 100)
}

const Cover = ({ url, position, preview }: CoverProps) => {
  const params = useParams()
  const coverImage = useCoverImage()
  const { removeCover, update } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<{ startY: number; startPosition: number } | null>(null)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [isSavingPosition, setIsSavingPosition] = useState(false)
  const [draftPosition, setDraftPosition] = useState(() => normalizeCoverPosition(position))
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'
  const normalizedPosition = normalizeCoverPosition(position)
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

  useEffect(() => {
    if (isAdjusting) return
    setDraftPosition(normalizedPosition)
  }, [isAdjusting, normalizedPosition])

  const onRemove = async () => {
    if (!params.documentId) return
    await removeCover(params.documentId as string)
    bump()
  }

  const onStartAdjust = () => {
    if (!url || preview) return
    setIsAdjusting(true)
  }

  const onCancelAdjust = () => {
    setDraftPosition(normalizedPosition)
    setIsAdjusting(false)
  }

  const onSavePosition = async () => {
    if (!params.documentId) {
      toast.error('Missing document ID for cover update')
      return
    }
    setIsSavingPosition(true)
    try {
      const nextPosition = Math.round(clamp(draftPosition, 0, 100) * 10) / 10
      await update(params.documentId as string, { coverPosition: nextPosition })
      bump()
      setIsAdjusting(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save cover position')
    } finally {
      setIsSavingPosition(false)
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdjusting) return
    if (event.button !== 0) return
    if (!containerRef.current) return
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    event.preventDefault()
    dragStateRef.current = { startY: event.clientY, startPosition: draftPosition }
    containerRef.current.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!isAdjusting || !dragState || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (!rect.height) return
    const delta = event.clientY - dragState.startY
    const deltaPercent = (delta / rect.height) * 100
    setDraftPosition(clamp(dragState.startPosition + deltaPercent, 0, 100))
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return
    dragStateRef.current = null
    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        'relative w-full h-[35vh] group',
        !url && 'h-[12vh]',
        url && 'bg-muted',
        isAdjusting && 'cursor-grab select-none touch-none',
      )}
    >
      {!!coverUrl && (
        <Image
          src={coverUrl}
          fill
          className="object-cover"
          style={{ objectPosition: `center ${draftPosition}%` }}
          alt="Cover"
          draggable={false}
        />
      )}
      {isAdjusting && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-xs font-medium text-white">
          Drag to reposition
        </div>
      )}
      {url && !preview && !isAdjusting && (
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-x-2 opacity-0 group-hover:opacity-100">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-xs text-muted-foreground"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Change Cover
          </Button>
          <Button
            onClick={onStartAdjust}
            className="text-xs text-muted-foreground"
            variant="outline"
            size="sm"
          >
            <MoveVertical className="mr-2 h-4 w-4" />
            Adjust Position
          </Button>
          <ConfirmModal onConfirm={onRemove}>
            <Button className="text-xs text-muted-foreground" variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Remove Cover
            </Button>
          </ConfirmModal>
        </div>
      )}
      {url && !preview && isAdjusting && (
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-x-2">
          <Button
            onClick={onSavePosition}
            className="text-xs"
            variant="default"
            size="sm"
            disabled={isSavingPosition}
          >
            Save Position
          </Button>
          <Button onClick={onCancelAdjust} className="text-xs" variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="bg-skeleton h-[12vh] w-full" />
}

export default Cover
