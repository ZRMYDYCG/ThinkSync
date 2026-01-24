'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'

import FlashThoughtItem from './flash-thought-item'
import PublishFlashThoughtDialog from './publish-flash-thought-dialog'
type FlashThoughtComment = {
  id: string
  authorName: string
  authorAvatar?: string | null
  content: string
  createdAt: string
  replies: FlashThoughtComment[]
}

type FlashThought = {
  id: string
  authorName: string
  authorAvatar?: string | null
  content: string
  images: string[]
  createdAt: string
  likedByMe: boolean
  likeCount: number
  comments: FlashThoughtComment[]
}

interface FlashThoughtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FlashThoughtDialog({ open, onOpenChange }: FlashThoughtDialogProps) {
  const tFlash = useTranslations('App.flashThoughts')
  const { user } = useAuth()

  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'following' | 'mine'>('all')
  const seedFlashThoughts: FlashThought[] = [
    {
      id: 'seed-1',
      authorName: 'Mira',
      authorAvatar:
        'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg',
      content: '刚整理完项目结构，准备把闪念模块接进来。',
      images: ['/documents.png'],
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      likedByMe: false,
      likeCount: 12,
      comments: [
        {
          id: 'seed-1-c1',
          authorName: 'Kai',
          authorAvatar: null,
          content: '这个节奏很棒，期待闪念上线后的体验。',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          replies: [
            {
              id: 'seed-1-c1-r1',
              authorName: 'Mira',
              authorAvatar:
                'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg',
              content: '谢谢反馈！后面会持续优化。',
              createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
              replies: [],
            },
          ],
        },
      ],
    },
    {
      id: 'seed-2',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: true,
      likeCount: 21,
      comments: [
        {
          id: 'seed-2-c1',
          authorName: 'Mira',
          authorAvatar:
            'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg',
          content: '有点像时间线+知识图谱的结合，挺酷。',
          createdAt: new Date(Date.now() - 1000 * 60 * 72).toISOString(),
          replies: [],
        },
      ],
    },
    {
      id: 'seed-3',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 8,
      comments: [],
    },
    {
      id: 'seed-4',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 3,
      comments: [],
    },
    {
      id: 'seed-5',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 6,
      comments: [],
    },
    {
      id: 'seed-6',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 4,
      comments: [],
    },
    {
      id: 'seed-7',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 2,
      comments: [],
    },
    {
      id: 'seed-8',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 1,
      comments: [],
    },
    {
      id: 'seed-9',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 0,
      comments: [],
    },
    {
      id: 'seed-10',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 0,
      comments: [],
    },
    {
      id: 'seed-11',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 0,
      comments: [],
    },
    {
      id: 'seed-12',
      authorName: 'Evan',
      authorAvatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
      content: '今天的灵感：把文档和闪念在同一视图里串联。',
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likedByMe: false,
      likeCount: 0,
      comments: [],
    },
  ]

  const [flashThoughts, setFlashThoughts] = useState<FlashThought[]>(seedFlashThoughts)

  const authorName = user?.name ?? user?.email ?? tFlash('anonymous')
  const authorAvatar = user?.avatarUrl ?? null
  const handlePublish = (content: string, images: File[]) => {
    const next: FlashThought = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      authorName,
      authorAvatar,
      content: content.trim(),
      images: images.map((file) => URL.createObjectURL(file)),
      createdAt: new Date().toISOString(),
      likedByMe: false,
      likeCount: 0,
      comments: [],
    }
    setFlashThoughts((prev) => [next, ...prev])
  }

  const filteredThoughts = flashThoughts.filter((item) => {
    if (filterMode === 'mine') {
      return item.authorName === authorName
    }
    if (filterMode === 'following') {
      return item.authorName !== authorName
    }
    return true
  })

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
          {filteredThoughts.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              {tFlash('empty')}
            </div>
          ) : (
            <Virtuoso
              data={filteredThoughts}
              className="pr-1"
              style={{ height: '60vh' }}
              itemContent={(index, item) => (
                <div className={index === 0 ? '' : 'pt-4'}>
                  <FlashThoughtItem
                    item={item}
                    authorName={authorName}
                    authorAvatar={authorAvatar}
                    setFlashThoughts={setFlashThoughts}
                  />
                </div>
              )}
            />
          )}
        </DialogContent>
      </Dialog>
      <PublishFlashThoughtDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        onPublish={handlePublish}
      />
    </>
  )
}
