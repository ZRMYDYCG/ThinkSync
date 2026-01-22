'use client'

import { Copy, ExternalLink, UserPlus } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrigin } from '@/hooks/use-origin'
import { useRoomsApi } from '@/hooks/use-rooms-api'
import { RoomRole } from '@/types/room'

interface InviteDialogProps {
  roomId: string | null
  docId: string
  canInvite: boolean
}

export const InviteDialog = ({ roomId, docId, canInvite }: InviteDialogProps) => {
  const origin = useOrigin()
  const { createInvite, revokeInvite } = useRoomsApi()

  const [inviteRole, setInviteRole] = useState<RoomRole>('EDITOR')
  const [inviteMaxUses, setInviteMaxUses] = useState<string>('1')
  const [inviteLink, setInviteLink] = useState<string>('')
  const [inviteCopied, setInviteCopied] = useState(false)
  const [recentInvites, setRecentInvites] = useState<
    Array<{
      id: string
      token: string
      role: RoomRole
      createdAt: string
      expiresAt: string | null
      maxUses: number
      usedCount: number
      revokedAt: string | null
    }>
  >([])

  const generateInvite = async () => {
    if (!roomId || !canInvite) return
    const maxUses = inviteMaxUses ? Number(inviteMaxUses) : undefined
    const invite = await createInvite(roomId, { role: inviteRole, maxUses })
    const link = `${origin}/documents/${docId}?invite=${invite.token}`
    setInviteLink(link)
    setRecentInvites((prev) => [invite, ...prev].slice(0, 5))
    await navigator.clipboard.writeText(link)
    setInviteCopied(true)
    window.setTimeout(() => setInviteCopied(false), 1500)
  }

  const revoke = async (inviteId: string) => {
    if (!roomId || !canInvite) return
    await revokeInvite(roomId, inviteId)
    setRecentInvites((prev) => prev.filter((i) => i.id !== inviteId))
  }

  if (!canInvite || !roomId) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" title="邀请">
          <UserPlus className="h-4 w-4" />
          <span className="sr-only">邀请</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>邀请协同成员</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>角色</Label>
            <div className="flex gap-2">
              {(['EDITOR', 'VIEWER'] as RoomRole[]).map((r) => (
                <Button
                  key={r}
                  type="button"
                  size="sm"
                  variant={inviteRole === r ? 'default' : 'outline'}
                  onClick={() => setInviteRole(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label>最大使用次数</Label>
            <Input
              type="number"
              min={1}
              value={inviteMaxUses}
              onChange={(e) => setInviteMaxUses(e.target.value)}
            />
          </div>
          <Button onClick={generateInvite}>生成并复制链接</Button>
          {inviteLink ? (
            <div className="rounded-md border bg-muted/30 p-2">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="h-9 w-full min-w-0 font-mono text-xs"
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9"
                  onClick={async () => {
                    await navigator.clipboard.writeText(inviteLink)
                    setInviteCopied(true)
                    window.setTimeout(() => setInviteCopied(false), 1500)
                  }}
                  title="复制"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">复制</span>
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9" asChild title="打开">
                  <Link href={inviteLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">打开</span>
                  </Link>
                </Button>
              </div>
              {inviteCopied ? (
                <div className="mt-1 text-xs text-muted-foreground">已复制</div>
              ) : null}
            </div>
          ) : null}
          {recentInvites.length ? (
            <div className="space-y-2 pt-2">
              <div className="text-sm font-medium">最近邀请</div>
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {recentInvites.map((i) => (
                  <div key={i.id} className="flex min-w-0 items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs text-muted-foreground">
                        {`${origin}/documents/${docId}?invite=${i.token}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {i.role} · {i.usedCount}/{i.maxUses}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => revoke(i.id)}
                    >
                      撤销
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
