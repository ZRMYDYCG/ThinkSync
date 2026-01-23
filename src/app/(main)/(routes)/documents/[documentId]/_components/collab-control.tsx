'use client'

import { Lock, Users } from 'lucide-react'
import React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RoomRole } from '@/types/room'

import { InviteDialog } from './invite-dialog'

interface CollabControlProps {
  collabEnabled: boolean
  onToggleCollab: () => void
  status: 'connecting' | 'connected' | 'disconnected'
  myRole: RoomRole | null
  canEditCollab: boolean
  canInvite: boolean
  isOwner: boolean
  roomId: string | null
  docId: string
  presence: Array<{ clientId: number; userId?: string; name?: string; color?: string }>
  members: Array<{ id: string; userId: string; role: RoomRole; name: string | null }>
}

export const CollabControl = ({
  collabEnabled,
  onToggleCollab,
  status,
  myRole,
  canEditCollab,
  canInvite,
  isOwner,
  roomId,
  docId,
  presence,
  members,
}: CollabControlProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOwner ? (
        <Button
          variant={collabEnabled ? 'default' : 'outline'}
          size="sm"
          className="h-8 rounded-full px-3"
          onClick={onToggleCollab}
          aria-pressed={collabEnabled}
        >
          <Users className="h-4 w-4" />
          {collabEnabled ? '协作已开启' : '协作已关闭'}
        </Button>
      ) : null}

      {collabEnabled ? (
        <div className="flex items-center gap-1 pr-1">
          <div className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground">
            <span
              className={[
                'h-2 w-2 rounded-full',
                status === 'connected'
                  ? 'bg-emerald-500'
                  : status === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-muted-foreground',
              ].join(' ')}
            />
            <span>
              {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中' : '未连接'}
            </span>
            {myRole ? <span>· {myRole}</span> : null}
            {!canEditCollab ? <span>· 只读</span> : null}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:bg-accent"
                title="成员"
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-[10px] text-muted-foreground">
                      +{presence.length - 4}
                    </div>
                  ) : null}
                </div>
                <span>{presence.length}</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>成员列表</DialogTitle>
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
                      <div className="text-xs text-muted-foreground">{m.role}</div>
                    </div>
                  )
                })}
                {members.length === 0 ? (
                  <div className="text-xs text-muted-foreground">暂无成员</div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>

          {canInvite ? <InviteDialog roomId={roomId} docId={docId} canInvite={canInvite} /> : null}
          {roomId && !myRole ? (
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground"
              title="该文档已开启协同，需要邀请加入"
            >
              <Lock className="h-3.5 w-3.5" />
              需要邀请
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
