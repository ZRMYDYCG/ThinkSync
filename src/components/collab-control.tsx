'use client'

import { Lock, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import { InviteDialog } from '@/app/(main)/(routes)/documents/[documentId]/_components/invite-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRoomsApi } from '@/hooks/use-rooms-api'
import { useCollabStore } from '@/store/collab-store'

interface CollabControlProps {
  docId: string
}

export const CollabControl = ({ docId }: CollabControlProps) => {
  const tTips = useTranslations('App.tips')
  const { getMembers } = useRoomsApi()

  const { myRole, presence, members, roomId, setMembers } = useCollabStore()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const collabEnabled = roomId !== null
  const canInvite = collabEnabled && myRole === 'OWNER'

  const refreshMembers = React.useCallback(async () => {
    if (!roomId) return
    setIsRefreshing(true)
    try {
      const memberResp = await getMembers(roomId)
      setMembers(
        memberResp.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          name: m.user.name,
        })),
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [getMembers, roomId, setMembers])

  if (!collabEnabled) return null

  return (
    <>
      <div className="flex items-center gap-1 pr-1">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:bg-accent flex items-center gap-2 rounded-full px-2 py-1 text-xs transition"
              title={tTips('collabMembers')}
            >
              <div className="flex -space-x-2">
                {presence.slice(0, 4).map((p) => (
                  <Avatar
                    key={p.clientId}
                    className="h-6 w-6 border"
                    style={{ backgroundColor: p.color ?? '#999' }}
                    title={p.name ?? 'Anonymous'}
                  >
                    <AvatarFallback className="text-[10px] text-white">
                      {(p.name ?? 'A').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {presence.length > 4 ? (
                  <div className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full border text-[10px]">
                    +{presence.length - 4}
                  </div>
                ) : null}
              </div>
              <span>{presence.length}</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle>{tTips('collabMembers')}</DialogTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={refreshMembers}
                  disabled={!roomId || isRefreshing}
                  title={tTips('collabRefresh')}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">{tTips('collabRefresh')}</span>
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-2">
              {members.map((m) => {
                const online = presence.some((p) => p.userId === m.userId)
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: online ? '#22c55e' : '#9ca3af' }}
                      />
                      <div className="min-w-0 truncate">{m.name ?? m.userId}</div>
                    </div>
                    <div className="text-muted-foreground text-xs">{m.role}</div>
                  </div>
                )
              })}
              {members.length === 0 ? (
                <div className="text-muted-foreground text-xs">{tTips('collabNoMembers')}</div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {canInvite ? (
          <InviteDialog
            roomId={useCollabStore.getState().roomId}
            docId={docId}
            canInvite={canInvite}
          />
        ) : null}
        {useCollabStore.getState().roomId && !myRole ? (
          <div
            className="text-muted-foreground flex items-center gap-1 rounded-full px-2 py-1 text-xs"
            title={tTips('collabNeedInvite')}
          >
            <Lock className="h-3.5 w-3.5" />
            {tTips('collabNeedInvite')}
          </div>
        ) : null}
      </div>
    </>
  )
}
