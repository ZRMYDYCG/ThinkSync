'use client'

import { Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface PublishFlashThoughtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: (content: string, images: File[]) => Promise<void>
  isSubmitting?: boolean
}

type PublishImageItem = {
  id: string
  file: File
  preview: string
}

const PublishFlashThoughtDialog = ({
  open,
  onOpenChange,
  onPublish,
  isSubmitting = false,
}: PublishFlashThoughtDialogProps) => {
  const tFlash = useTranslations('App.flashThoughts')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<PublishImageItem[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const maxContentLength = 500
  const publishDisabled = (content.trim().length === 0 && images.length === 0) || isSubmitting

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setContent('')
      images.forEach((item) => URL.revokeObjectURL(item.preview))
      setImages([])
    }
  }

  const handleSubmit = async () => {
    if (publishDisabled) return
    try {
      await onPublish(
        content,
        images.map((item) => item.file),
      )
      setContent('')
      images.forEach((item) => URL.revokeObjectURL(item.preview))
      setImages([])
      onOpenChange(false)
    } catch {
      return
    }
  }

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (files.length === 0) return
    setImages((prev) => {
      const remaining = Math.max(0, 9 - prev.length)
      const nextFiles = files.slice(0, remaining)
      const nextItems = nextFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      }))
      return [...prev, ...nextItems]
    })
    event.target.value = ''
  }

  const handleAddClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      return
    }
    setImages((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.preview)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{tFlash('publishTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <TextareaAutosize
              minRows={4}
              maxRows={8}
              value={content}
              onChange={(event) => setContent(event.target.value.slice(0, maxContentLength))}
              placeholder={tFlash('contentPlaceholder')}
              className="border-input focus-visible:ring-ring bg-background w-full resize-none overflow-y-auto rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-offset-1"
            />
            <div className="text-muted-foreground absolute right-3 bottom-2 text-xs">
              {content.length}/{maxContentLength}
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid w-full max-w-[320px] grid-cols-3 gap-2">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="border-input group relative aspect-square overflow-hidden rounded-md border"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                >
                  <Image
                    src={item.preview}
                    alt={tFlash('image')}
                    fill
                    sizes="(max-width: 640px) 33vw, 180px"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(item.id)}
                    className="bg-background/90 text-muted-foreground hover:text-foreground absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 9 ? (
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="border-input text-muted-foreground hover:bg-accent flex aspect-square items-center justify-center rounded-md border border-dashed text-xs"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            {tFlash('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={publishDisabled}>
            {tFlash('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PublishFlashThoughtDialog
