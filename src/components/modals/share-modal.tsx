'use client'

import { Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useShareModal } from '@/hooks/use-share-modal'

type PermissionType = 'readWrite' | 'readOnly'
type LinkExpiry = 'permanent' | '7days' | '30days'

export const ShareModal = () => {
  const shareModal = useShareModal()
  const t = useTranslations('App.share')

  const [permission, setPermission] = useState<PermissionType>('readWrite')
  const [linkExpiry, setLinkExpiry] = useState<LinkExpiry>('permanent')
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate mock share link when modal opens
  useEffect(() => {
    if (shareModal.isOpen) {
      // TODO: Replace with actual API call to generate share link
      const mockLink = `${window.location.origin}/share/${Math.random().toString(36).substring(7)}`
      setShareLink(mockLink)
    }
  }, [shareModal.isOpen])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success(t('linkCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={shareModal.isOpen} onOpenChange={shareModal.onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Permission Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('permissionSettings')}</Label>
            <RadioGroup
              value={permission}
              onValueChange={(value) => setPermission(value as PermissionType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="readWrite" id="readWrite" />
                <Label htmlFor="readWrite" className="cursor-pointer font-normal">
                  {t('readWrite')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="readOnly" id="readOnly" />
                <Label htmlFor="readOnly" className="cursor-pointer font-normal">
                  {t('readOnly')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('shareLink')}</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button onClick={handleCopyLink} variant="outline" size="icon" className="shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Link Expiry */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('linkExpiry')}</Label>
            <Select
              value={linkExpiry}
              onValueChange={(value) => setLinkExpiry(value as LinkExpiry)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">{t('permanent')}</SelectItem>
                <SelectItem value="7days">{t('expiresIn7Days')}</SelectItem>
                <SelectItem value="30days">{t('expiresIn30Days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
