'use client'

import dynamic from 'next/dynamic'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as Y from 'yjs'

import Cover from '@/components/cover'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument } from '@/hooks/use-document'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useRoomsApi } from '@/hooks/use-rooms-api'
import { CollabSocketProvider } from '@/lib/collab-socket-provider'
import { useAuthStore } from '@/store/auth-store'
import { useCollabStore } from '@/store/collab-store'
import { useTabsStore } from '@/store/tabs-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'

const toHex = (n: number) => n.toString(16).padStart(2, '0')

const colorFromString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  const r = (hash & 0xff0000) >> 16
  const g = (hash & 0x00ff00) >> 8
  const b = hash & 0x0000ff
  return `#${toHex((r + 256) % 256)}${toHex((g + 256) % 256)}${toHex((b + 256) % 256)}`
}

const DocumentIdPage = () => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const Editor = useMemo(() => dynamic(() => import('@/components/editor'), { ssr: false }), [])
  const RoomEditor = useMemo(
    () =>
      dynamic(() => import('@/components/room-editor').then((m) => m.RoomEditor), { ssr: false }),
    [],
  )

  const docId = params.documentId as string
  const { document, refetch } = useDocument(docId)
  const { update } = useDocumentsApi()
  const { createRoom, getRoom, getRoomByDocument, getMembers, acceptInvite } = useRoomsApi()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setDirty = useTabsStore((s) => s.setDirty)

  // 从 store 获取协同状态
  const collabEnabled = useCollabStore((s) => s.collabEnabled)
  const myRole = useCollabStore((s) => s.myRole)
  const roomId = useCollabStore((s) => s.roomId)
  const setCollabEnabled = useCollabStore((s) => s.setCollabEnabled)
  const setRoomId = useCollabStore((s) => s.setRoomId)
  const setMyRole = useCollabStore((s) => s.setMyRole)
  const setStatus = useCollabStore((s) => s.setStatus)
  const setPresence = useCollabStore((s) => s.setPresence)
  const setMembers = useCollabStore((s) => s.setMembers)
  const resetCollab = useCollabStore((s) => s.reset)

  const contentRef = useRef<string | null>(null)
  const changeSeqRef = useRef(0)
  const inviteToken = searchParams.get('invite')

  const [isJoiningInvite, setIsJoiningInvite] = useState(false)
  const [joinInviteError, setJoinInviteError] = useState<string | null>(null)
  const [provider, setProvider] = useState<CollabSocketProvider | null>(null)
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [isNewRoom, setIsNewRoom] = useState(false)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collabStateRef = useRef<{ roomId: string | null; myRole: typeof myRole }>({
    roomId,
    myRole,
  })

  useEffect(() => {
    contentRef.current = document?.content ?? null
  }, [document?.content])

  useEffect(() => {
    collabStateRef.current = { roomId, myRole }
  }, [roomId, myRole])

  useEffect(() => {
    const handler = async (event: Event) => {
      const e = event as CustomEvent<{ docId?: string }>
      if (!e.detail?.docId || e.detail.docId !== docId) return
      if (!contentRef.current) return
      if (collabEnabled && myRole !== 'OWNER' && myRole !== 'EDITOR') return
      const seq = ++changeSeqRef.current
      setDirty(docId, true)
      await update(docId, { content: contentRef.current })
      if (changeSeqRef.current === seq) setDirty(docId, false)
    }
    window.addEventListener('thinksync:tab-save-request', handler)
    return () => window.removeEventListener('thinksync:tab-save-request', handler)
  }, [collabEnabled, docId, myRole, setDirty, update])

  useEffect(() => {
    if (!token || !user) return
    const init = async () => {
      setCollabEnabled(true)
      if (inviteToken) {
        setIsJoiningInvite(true)
        setJoinInviteError(null)
        try {
          const accepted = await acceptInvite(inviteToken)
          const roomResp = await getRoom(accepted.roomId)
          if (roomResp.room.documentId !== docId) {
            router.replace(`/documents/${roomResp.room.documentId}`)
            return
          }
          setRoomId(accepted.roomId)
          setMyRole(accepted.role)
          setCollabEnabled(true)
          await refetch()

          const next = new URL(window.location.href)
          next.searchParams.delete('invite')
          router.replace(next.pathname + next.search)
          return
        } catch (e) {
          const message = e instanceof Error ? e.message : '加入协同失败'
          setJoinInviteError(message)
        } finally {
          setIsJoiningInvite(false)
        }
      }

      if (!collabEnabled) {
        setRoomId(null)
        setMyRole(null)
        return
      }

      const byDoc = await getRoomByDocument(docId)
      setRoomId(byDoc.room?.id ?? null)
      setMyRole(byDoc.myRole ?? null)
    }

    init().catch(() => {
      setRoomId(null)
      setMyRole(null)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    acceptInvite,
    collabEnabled,
    docId,
    getRoom,
    getRoomByDocument,
    inviteToken,
    refetch,
    router,
    token,
    user,
  ])

  useEffect(() => {
    if (!collabEnabled) return
    if (!token || !user) return

    const run = async () => {
      let currentRoomId = collabStateRef.current.roomId
      let role = collabStateRef.current.myRole
      let shouldSeed = false

      const byDoc = await getRoomByDocument(docId)
      if (!currentRoomId || byDoc.room?.id !== currentRoomId) {
        currentRoomId = byDoc.room?.id ?? null
        role = byDoc.myRole ?? null
      }

      if (!currentRoomId) {
        const created = await createRoom({ documentId: docId })
        currentRoomId = created.id
        role = 'OWNER'
        shouldSeed = true
      } else if (!role) {
        if (byDoc.room?.id === currentRoomId && byDoc.myRole) {
          role = byDoc.myRole
        } else {
          const created = await createRoom({ documentId: docId })
          currentRoomId = created.id
          const roomResp = await getRoom(created.id)
          role = roomResp.myRole
        }
      }

      if (!currentRoomId || !role) {
        setCollabEnabled(false)
        return
      }

      setRoomId(currentRoomId)
      setMyRole(role)
      setIsNewRoom(shouldSeed)

      const memberResp = await getMembers(currentRoomId)
      setMembers(
        memberResp.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          name: m.user.name,
        })),
      )

      const doc = new Y.Doc()
      const canEdit = () => role === 'OWNER' || role === 'EDITOR'
      const p = new CollabSocketProvider(
        doc,
        { baseUrl: API_BASE_URL, roomId: currentRoomId, token },
        canEdit,
      )

      const myName = user.name ?? user.email ?? 'User'
      const myColor = user.id ? colorFromString(user.id) : '#888888'
      p.awareness.setLocalStateField('user', { id: user.id, name: myName, color: myColor })

      const statusListener = (e: { status: 'connecting' | 'connected' | 'disconnected' }) => {
        setStatus(e.status)
      }
      p.on('status', statusListener)

      const updatePresence = () => {
        const entries: Array<{ clientId: number; userId?: string; name?: string; color?: string }> =
          []
        for (const [clientId, state] of p.awareness.getStates()) {
          const u = (state as any)?.user
          entries.push({
            clientId,
            userId: typeof u?.id === 'string' ? u.id : undefined,
            name: typeof u?.name === 'string' ? u.name : undefined,
            color: typeof u?.color === 'string' ? u.color : undefined,
          })
        }
        setPresence(entries)
      }

      const awarenessListener = () => updatePresence()
      p.awareness.on('change', awarenessListener)
      updatePresence()

      setProvider(p)
      setYdoc(doc)

      return () => {
        p.off('status', statusListener)
        p.awareness.off('change', awarenessListener)
        p.destroy()
        doc.destroy()
      }
    }

    let alive = true
    let cleanup: (() => void) | undefined
    run()
      .then((c) => {
        if (!alive) {
          c?.()
          return null
        }
        cleanup = c
        return null
      })
      .catch(() => {
        if (!alive) return
        resetCollab()
        return null
      })

    return () => {
      alive = false
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      setPresence([])
      setMembers([])
      setProvider(null)
      setYdoc(null)
      setIsNewRoom(false)
      setStatus('disconnected')
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collabEnabled,
    createRoom,
    docId,
    getMembers,
    getRoom,
    getRoomByDocument,
    resetCollab,
    token,
    user,
  ])

  const onChange = async (content: string) => {
    contentRef.current = content
    const seq = ++changeSeqRef.current
    setDirty(docId, true)
    await update(docId, { content })
    if (changeSeqRef.current === seq) setDirty(docId, false)
  }

  const canEditCollab = myRole === 'OWNER' || myRole === 'EDITOR'

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton></Cover.Skeleton>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[80%]"></Skeleton>
            <Skeleton className="h-10 w-[60%]"></Skeleton>
            <Skeleton className="h-8 w-[50%]"></Skeleton>
            <Skeleton className="h-4 w-[40%]"></Skeleton>
            <Skeleton className="h-2 w-[30%]"></Skeleton>
          </div>
        </div>
      </div>
    )
  }

  if (document === null) {
    const myName = user?.name ?? user?.email ?? 'User'
    const myColor = user?.id ? colorFromString(user.id) : '#888888'
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0 text-sm text-muted-foreground">
            {inviteToken || isJoiningInvite
              ? isJoiningInvite
                ? '正在加入协同…'
                : '正在处理邀请…'
              : joinInviteError
                ? `加入失败：${joinInviteError}`
                : '无法访问该文档'}
          </div>
        </div>
        {collabEnabled ? (
          provider && ydoc && myRole && user ? (
            <RoomEditor
              ydoc={ydoc}
              provider={provider}
              editable={canEditCollab}
              user={{ name: myName, color: myColor }}
              initialContent={null}
              onChange={async (content: string) => {
                contentRef.current = content
                if (!canEditCollab) return
                setDirty(docId, true)
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
                saveTimerRef.current = setTimeout(async () => {
                  const content = contentRef.current
                  if (content === null) return
                  const seq = ++changeSeqRef.current
                  await update(docId, { content })
                  if (changeSeqRef.current === seq) setDirty(docId, false)
                }, 800)
              }}
            />
          ) : (
            <div className="py-6 text-sm text-muted-foreground">正在连接协同…</div>
          )
        ) : null}
      </div>
    )
  }

  const onCollabChange = async (content: string) => {
    contentRef.current = content
    if (!canEditCollab) return
    setDirty(docId, true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      const content = contentRef.current
      if (content === null) return
      const seq = ++changeSeqRef.current
      await update(docId, { content })
      if (changeSeqRef.current === seq) setDirty(docId, false)
    }, 800)
  }

  const myName = user?.name ?? user?.email ?? 'User'
  const myColor = user?.id ? colorFromString(user.id) : '#888888'

  return (
    <React.Fragment>
      <div className="pb-40">
        <Cover
          url={document.coverImage ?? undefined}
          position={document.coverPosition ?? undefined}
        ></Cover>
        <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
          <div className="relative">
            <Toolbar initialData={document}></Toolbar>
          </div>

          {collabEnabled ? (
            provider && ydoc && myRole && user ? (
              <RoomEditor
                ydoc={ydoc}
                provider={provider}
                editable={canEditCollab}
                user={{ name: myName, color: myColor }}
                initialContent={isNewRoom ? document.content : null}
                onChange={onCollabChange}
              />
            ) : (
              <div className="px-8 py-6 text-sm text-muted-foreground">正在连接协同…</div>
            )
          ) : (
            <Editor onChange={onChange} initialContent={document.content} />
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default DocumentIdPage
