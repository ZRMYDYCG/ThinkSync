'use client'

import { ChevronsLeftRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useUploadsApi } from '@/hooks/use-uploads-api'

const UserItem = () => {
  const tMenu = useTranslations('App.userMenu')
  const tNavbar = useTranslations('App.navbar')
  const tToast = useTranslations('App.toast')
  const { user, logout, updateProfile } = useAuth()
  const { uploadImage } = useUploadsApi()
  const displayName = user?.name ?? user?.email ?? tMenu('Account')
  const initial = (Array.from(displayName.trim())[0] ?? 'A').toUpperCase()
  const secondaryText = user?.email && user.email !== displayName ? user.email : null

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isEditOpen) return
    setName(user?.name ?? '')
    setAvatarUrl(user?.avatarUrl ?? null)
  }, [isEditOpen, user?.avatarUrl, user?.name])

  const onChooseAvatar = () => {
    fileInputRef.current?.click()
  }

  const onAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const url = await uploadImage(file)
      setAvatarUrl(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tToast('AvatarUploadFailed'))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const onSave = async () => {
    if (!user) {
      toast.error(tToast('LoginRequired'))
      return
    }
    setIsSubmitting(true)
    try {
      await updateProfile({
        name: name.trim() ? name.trim() : null,
        avatarUrl,
      })
      toast.success(tToast('ProfileUpdated'))
      setIsEditOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tToast('ProfileUpdateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:bg-primary/5 focus-visible:ring-ring flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm leading-5 font-medium">{displayName}</div>
              {secondaryText && (
                <div className="text-muted-foreground truncate text-xs">{secondaryText}</div>
              )}
            </div>
            <ChevronsLeftRight className="text-muted-foreground h-4 w-4 shrink-0 rotate-90" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start" alignOffset={11} forceMount>
          <div className="flex items-center gap-x-3 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              {secondaryText && (
                <p className="text-muted-foreground truncate text-xs">{secondaryText}</p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="w-full cursor-pointer"
            disabled={!user}
            onClick={() => setIsEditOpen(true)}
          >
            {tMenu('EditProfile')}
          </DropdownMenuItem>
          <DropdownMenuItem className="w-full cursor-pointer" onClick={logout}>
            {tNavbar('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tMenu('EditProfile')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="block text-center">{tMenu('Avatar')}</Label>
              <div className="flex flex-col items-center justify-center gap-y-2">
                <button
                  type="button"
                  onClick={onChooseAvatar}
                  disabled={isUploadingAvatar || isSubmitting}
                  className="group focus-visible:ring-ring relative rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
                >
                  <Avatar className="h-16 w-16 cursor-pointer">
                    <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="bg-background/70 text-foreground absolute inset-0 flex items-center justify-center rounded-full text-xs font-medium">
                      {tMenu('Uploading')}
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarFileChange}
                  disabled={isUploadingAvatar || isSubmitting}
                />
                <div className="text-muted-foreground text-xs">
                  {isUploadingAvatar ? tMenu('UploadingAvatar') : tMenu('UploadAvatar')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">{tMenu('DisplayName')}</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tMenu('DisplayNamePlaceholder')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              {tMenu('Cancel')}
            </Button>
            <Button type="button" onClick={onSave} disabled={isSubmitting || isUploadingAvatar}>
              {isSubmitting ? tMenu('Saving') : tMenu('Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserItem
