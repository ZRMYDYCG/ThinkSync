'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { toast } from 'sonner'

import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useFlashThoughtsApi } from '@/hooks/use-flash-thoughts-api'
import { useUploadsApi } from '@/hooks/use-uploads-api'
import { FlashThought, FlashThoughtComment } from '@/types/flash-thought'

import FlashThoughtItem from './flash-thought-item'
import PublishFlashThoughtDialog from './publish-flash-thought-dialog'

const addReplyToComments = (
  comments: FlashThoughtComment[],
  parentId: string,
  reply: FlashThoughtComment,
): FlashThoughtComment[] =>
  comments.map((comment) =>
    comment.id === parentId
      ? { ...comment, replies: [reply, ...comment.replies] }
      : { ...comment, replies: addReplyToComments(comment.replies, parentId, reply) },
  )

interface FlashThoughtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FlashThoughtDialog({ open, onOpenChange }: FlashThoughtDialogProps) {
  const tFlash = useTranslations('App.flashThoughts')
  const { user } = useAuth()
  const { list, create, toggleLike, addComment } = useFlashThoughtsApi()
  const { uploadImage } = useUploadsApi()

  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'following' | 'mine'>('all')
  const [flashThoughts, setFlashThoughts] = useState<FlashThought[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const authorName = user?.name ?? user?.email ?? tFlash('anonymous')
  const authorAvatar = user?.avatarUrl ?? null

  const scrollToTop = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: 0,
      align: 'start',
      behavior: 'smooth',
    })
  }, [])

  const fetchThoughts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await list(filterMode)
      setFlashThoughts(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : tFlash('empty')
      toast.error(message)
      setFlashThoughts([])
    } finally {
      setIsLoading(false)
    }
  }, [filterMode, list, tFlash])

  useEffect(() => {
    if (!open) return
    fetchThoughts()
    scrollToTop()
  }, [fetchThoughts, open, scrollToTop])

  const handlePublish = async (content: string, images: File[]) => {
    setIsPublishing(true)
    try {
      const imageUrls = await Promise.all(images.map((file) => uploadImage(file)))
      await create({ content: content.trim(), images: imageUrls })
      await fetchThoughts()
    } catch (error) {
      const message = error instanceof Error ? error.message : tFlash('empty')
      toast.error(message)
      throw error
    } finally {
      setIsPublishing(false)
    }
  }

  const handleToggleLike = async (thoughtId: string) => {
    try {
      const data = await toggleLike(thoughtId)
      setFlashThoughts((prev) =>
        prev.map((entry) => (entry.id === thoughtId ? { ...entry, ...data } : entry)),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : tFlash('empty')
      toast.error(message)
    }
  }

  const handleAddComment = async (thoughtId: string, content: string, parentId?: string) => {
    try {
      const newComment = await addComment(thoughtId, { content, parentId })
      setFlashThoughts((prev) =>
        prev.map((entry) =>
          entry.id !== thoughtId
            ? entry
            : parentId
              ? {
                  ...entry,
                  comments: addReplyToComments(entry.comments, parentId, newComment),
                }
              : { ...entry, comments: [newComment, ...entry.comments] },
        ),
      )
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : tFlash('empty')
      toast.error(message)
      return false
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[820px] [&>button]:hidden">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="border-input bg-background text-foreground hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs"
                >
                  <span>
                    {tFlash('filterLabel')}: {tFlash(filterMode)}
                  </span>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setFilterMode('all')}>
                  {tFlash('all')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMode('following')}>
                  {tFlash('following')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMode('mine')}>
                  {tFlash('mine')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => setIsPublishOpen(true)}>
              {tFlash('publish')}
            </Button>
          </div>
          {isLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : flashThoughts.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              {tFlash('empty')}
            </div>
          ) : (
            <div className="relative">
              <Virtuoso
                ref={virtuosoRef}
                data={flashThoughts}
                className="pr-1"
                style={{ height: '60vh' }}
                itemContent={(index, item) => (
                  <div className={index === 0 ? '' : 'pt-4'}>
                    <FlashThoughtItem
                      item={item}
                      authorName={authorName}
                      authorAvatar={authorAvatar}
                      onToggleLike={handleToggleLike}
                      onAddComment={handleAddComment}
                    />
                  </div>
                )}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 bottom-4 z-10 h-9 w-9 shadow-md"
                onClick={scrollToTop}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <PublishFlashThoughtDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        onPublish={handlePublish}
        isSubmitting={isPublishing}
      />
    </>
  )
}
