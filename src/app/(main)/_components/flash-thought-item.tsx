'use client'

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Reply,
  Send,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { FlashThought, FlashThoughtComment } from '@/types/flash-thought'

const countComments = (comments: FlashThoughtComment[]): number =>
  comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0)

export interface FlashThoughtItemProps {
  item: FlashThought
  authorName: string
  authorAvatar: string | null
  onToggleLike: (thoughtId: string) => Promise<void>
  onAddComment: (thoughtId: string, content: string, parentId?: string) => Promise<boolean>
}

const FlashThoughtItem = ({
  item,
  authorName,
  authorAvatar,
  onToggleLike,
  onAddComment,
}: FlashThoughtItemProps) => {
  const tFlash = useTranslations('App.flashThoughts')
  const [commentDraft, setCommentDraft] = useState('')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [openReplyInputs, setOpenReplyInputs] = useState<Record<string, boolean>>({})
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const createdAt = new Date(item.createdAt)
  const timeLabel = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleString()
  const initial = Array.from(item.authorName.trim())[0]?.toUpperCase() ?? 'A'

  const handleToggleLike = async () => {
    await onToggleLike(item.id)
  }

  const handleAddComment = async () => {
    const draft = commentDraft.trim()
    if (!draft) return
    const success = await onAddComment(item.id, draft)
    if (success) {
      setCommentDraft('')
    }
  }

  const handleAddReply = async (commentId: string) => {
    const draft = replyDrafts[commentId]?.trim()
    if (!draft) return
    const success = await onAddComment(item.id, draft, commentId)
    if (success) {
      setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }))
      setOpenReplyInputs((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  const toggleReplyInput = (commentId: string) => {
    setOpenReplyInputs((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const toggleComments = () => {
    setIsCollapsed((prev) => !prev)
  }

  const handleOpenPreview = (index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const handlePreviewPrev = () => {
    setPreviewIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
  }

  const handlePreviewNext = () => {
    setPreviewIndex((prev) => (prev + 1) % item.images.length)
  }

  const renderComment = (comment: FlashThoughtComment, depth = 0) => {
    const commentTime = new Date(comment.createdAt)
    const commentLabel = Number.isNaN(commentTime.getTime()) ? '' : commentTime.toLocaleString()
    const commentInitial = Array.from(comment.authorName.trim())[0]?.toUpperCase() ?? 'A'
    const hasReplies = comment.replies.length > 0
    return (
      <div key={comment.id} className={cn('space-y-2', depth > 0 && 'pl-6')}>
        <div
          className={cn('flex items-start gap-2', depth > 0 && 'border-l border-border/60 pl-4')}
        >
          <Avatar className="mt-0.5 h-7 w-7">
            {comment.authorAvatar ? <AvatarImage src={comment.authorAvatar} /> : null}
            <AvatarFallback className="text-[10px]">{commentInitial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 rounded-lg px-3 py-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs font-medium">{comment.authorName}</span>
              <span className="text-muted-foreground text-[10px]">{commentLabel}</span>
            </div>
            <p className="text-xs leading-5 whitespace-pre-wrap">{comment.content}</p>
            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2"
                onClick={() => toggleReplyInput(comment.id)}
              >
                <Reply className="h-3 w-3" />
                <span>{tFlash('reply')}</span>
              </Button>
              {hasReplies ? (
                <span>{tFlash('replyCount', { count: countComments(comment.replies) })}</span>
              ) : null}
            </div>
            {openReplyInputs[comment.id] ? (
              <div className="mt-2 flex items-start gap-2">
                <TextareaAutosize
                  minRows={1}
                  value={replyDrafts[comment.id] ?? ''}
                  onChange={(event) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [comment.id]: event.target.value,
                    }))
                  }
                  placeholder={tFlash('replyPlaceholder')}
                  className="border-input focus-visible:ring-ring bg-background w-full resize-none rounded-md border px-3 py-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-offset-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleAddReply(comment.id)}
                  disabled={!replyDrafts[comment.id]?.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {hasReplies ? comment.replies.map((reply) => renderComment(reply, depth + 1)) : null}
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          {item.authorAvatar ? <AvatarImage src={item.authorAvatar} /> : null}
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium">{item.authorName}</span>
            <span className="text-muted-foreground text-xs">{timeLabel}</span>
          </div>
          {item.content ? (
            <p className="text-foreground/90 mt-2 text-sm leading-6 whitespace-pre-wrap">
              {item.content}
            </p>
          ) : null}
          {item.images.length > 0 ? (
            <div className="mt-3 grid w-full max-w-[320px] grid-cols-3 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  onClick={() => handleOpenPreview(index)}
                  className="border-input relative aspect-square overflow-hidden rounded-md border"
                >
                  <Image
                    src={image}
                    alt={tFlash('image')}
                    fill
                    sizes="(max-width: 640px) 33vw, 180px"
                    className="object-cover"
                    unoptimized={image.startsWith('blob:') || image.startsWith('data:')}
                  />
                </button>
              ))}
            </div>
          ) : null}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="sm:max-w-[900px]">
              <div className="relative flex items-center justify-center">
                {item.images[previewIndex] ? (
                  <Image
                    src={item.images[previewIndex]}
                    alt={tFlash('image')}
                    width={1200}
                    height={900}
                    className="max-h-[70vh] w-full rounded-lg object-contain"
                    unoptimized={
                      item.images[previewIndex].startsWith('blob:') ||
                      item.images[previewIndex].startsWith('data:')
                    }
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 h-9 w-9 -translate-y-1/2"
                  onClick={handlePreviewPrev}
                  disabled={item.images.length <= 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 h-9 w-9 -translate-y-1/2"
                  onClick={handlePreviewNext}
                  disabled={item.images.length <= 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-xs">
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2" onClick={handleToggleLike}>
              <Heart
                className={cn(
                  'h-4 w-4',
                  item.likedByMe ? 'fill-primary text-primary' : 'text-muted-foreground',
                )}
              />
              <span className={item.likedByMe ? 'text-primary' : undefined}>{tFlash('like')}</span>
              <span>{item.likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2" onClick={toggleComments}>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <MessageCircle className="h-4 w-4" />
              <span>{tFlash('commentCount', { count: countComments(item.comments) })}</span>
              <span>{isCollapsed ? tFlash('showComments') : tFlash('hideComments')}</span>
            </Button>
          </div>
          {isCollapsed ? null : (
            <div className="border-border/60 mt-3 space-y-3 rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <Avatar className="mt-0.5 h-7 w-7">
                  {authorAvatar ? <AvatarImage src={authorAvatar} /> : null}
                  <AvatarFallback className="text-[10px]">
                    {Array.from(authorName.trim())[0]?.toUpperCase() ?? 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 items-center gap-2">
                  <TextareaAutosize
                    minRows={1}
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder={tFlash('commentPlaceholder')}
                    className="border-input focus-visible:ring-ring bg-background w-full resize-none rounded-md border px-3 py-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-offset-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleAddComment}
                    disabled={!commentDraft.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {countComments(item.comments) === 0 ? (
                  <div className="text-muted-foreground text-xs">{tFlash('commentEmpty')}</div>
                ) : (
                  item.comments.map((comment) => renderComment(comment))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashThoughtItem
