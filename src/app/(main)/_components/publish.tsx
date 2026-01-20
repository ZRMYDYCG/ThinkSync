'use client'

import { Check, Copy, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { useOrigin } from '@/hooks/use-origin'
import { Document } from '@/types/document'

interface PublishProps {
  initialData: Document
}

const Publish = ({ initialData }: PublishProps) => {
  const origin = useOrigin()
  const { update } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const url = `${origin}/preview/${initialData.id}`

  const tGlobal = useTranslations('Global')
  const tTips = useTranslations('App.tips')

  const onPublish = () => {
    setIsSubmitting(true)

    const promise = update(initialData.id, {
      isPublished: true,
    })
      .then(() => {
        bump()
      })
      .finally(() => setIsSubmitting(false))

    toast.promise(promise, {
      loading: 'Publishing...',
      success: 'Published!',
      error: 'Failed to publish.',
    })
  }

  const onUnPublish = () => {
    setIsSubmitting(true)

    const promise = update(initialData.id, {
      isPublished: false,
    })
      .then(() => {
        bump()
      })
      .finally(() => setIsSubmitting(false))

    toast.promise(promise, {
      loading: 'UnPublishing...',
      success: 'UnPublished!',
      error: 'Failed to UnPublish.',
    })
  }

  const onCopy = () => {
    navigator.clipboard.writeText(url)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          <Globe className="h-4 w-4 text-sky-500"></Globe>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {initialData.isPublished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <Globe className="h-4 w-4 animate-pulse text-sky-500" />
              <p className="text-sm font-medium text-sky-500">{tTips('ThisDocumentIsPublished')}</p>
            </div>
            <div className="flex items-center">
              <input
                value={url}
                className="h-8 flex-1 truncate rounded-l-md border bg-muted px-2 text-xs"
                disabled
              />
              <Button onClick={onCopy} disabled={copied} className="h-8 rounded-l-none">
                {copied ? (
                  <Check className="h-4 w-4"></Check>
                ) : (
                  <Copy className="h-4 w-4">Copy</Copy>
                )}
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full text-xs"
              disabled={isSubmitting}
              onClick={onUnPublish}
            >
              {tGlobal('unpublish')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Globe className="mb-2 h-8 w-8 text-muted-foreground text-sky-500"></Globe>
            <p className="mb-2 text-sm font-medium">{tTips('PublishThisDocument')}</p>
            <span className="mb-4 text-xs text-muted-foreground">
              {tTips('ShareYourDocumentWithTheWorld')}
            </span>
            <Button
              disabled={isSubmitting}
              onClick={onPublish}
              className="w-full text-xs"
              size="sm"
            >
              {tGlobal('publish')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default Publish
