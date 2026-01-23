'use client'

import dynamic from 'next/dynamic'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { RoomRole } from '@/types/room'

import { CollabControl } from './_components/collab-control'

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
  const { createRoom, getRoom, getRoomByDocument, getMembers, acceptInvite, disableCollab } =
    useRoomsApi()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setDirty = useTabsStore((s) => s.setDirty)

  // 从 store 获取协同状态
  const status = useCollabStore((s) => s.status)
  const presence = useCollabStore((s) => s.presence)
  const members = useCollabStore((s) => s.members)
  const setStatus = useCollabStore((s) => s.setStatus)
  const setPresence = useCollabStore((s) => s.setPresence)
  const setMembers = useCollabStore((s) => s.setMembers)
  const sharedContent = useCollabStore((s) => s.contentByDoc[docId])
  const setSharedContent = useCollabStore((s) => s.setContent)
  const resetCollab = useCollabStore((s) => s.reset)

  const contentRef = useRef<string | null>(null)
  const changeSeqRef = useRef(0)
  const inviteToken = searchParams.get('invite')

  // 本地协同状态
  const [localRoomId, setLocalRoomId] = useState<string | null>(null)
  const [localMyRole, setLocalMyRole] = useState<RoomRole | null>(null)
  const [localIsOwner, setLocalIsOwner] = useState(false)
  const collabEnabled = localRoomId !== null

  const [isJoiningInvite, setIsJoiningInvite] = useState(false)
  const [joinInviteError, setJoinInviteError] = useState<string | null>(null)
  const [provider, setProvider] = useState<CollabSocketProvider | null>(null)
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [collabSeed, setCollabSeed] = useState<string | null>(null)
  const [collabSeedKey, setCollabSeedKey] = useState(0)
  const [nonCollabSeed, setNonCollabSeed] = useState<string | null>(null)
  const [nonCollabSeedKey, setNonCollabSeedKey] = useState(0)
  const [collabSlot, setCollabSlot] = useState<HTMLElement | null>(null)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const providerRef = useRef<CollabSocketProvider | null>(null)
  const ydocRef = useRef<Y.Doc | null>(null)

  useEffect(() => {
    if (sharedContent !== undefined) {
      contentRef.current = sharedContent
      return
    }
    contentRef.current = document?.content ?? null
  }, [document?.content, sharedContent])

  useEffect(() => {
    if (sharedContent !== undefined) return
    if (!document) return
    setSharedContent(docId, document.content ?? null)
  }, [docId, document, setSharedContent, sharedContent])

  useEffect(() => {
    if (sharedContent === undefined) return
    if (collabEnabled) {
      if (collabSeed === null) {
        setCollabSeed(sharedContent)
        setCollabSeedKey((value) => value + 1)
      }
      return
    }
    if (nonCollabSeed === null) {
      setNonCollabSeed(sharedContent)
      setNonCollabSeedKey((value) => value + 1)
    }
  }, [collabEnabled, collabSeed, nonCollabSeed, sharedContent])

  useEffect(() => {
    let active = true
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const resolveSlot = () => {
      const el = globalThis.document?.getElementById('collab-control-slot') ?? null
      if (active) {
        setCollabSlot(el)
      }
    }

    // 立即检查
    resolveSlot()

    // 延迟检查（确保 DOM 渲染完成）
    timeoutId = setTimeout(resolveSlot, 100)

    // 监听 DOM 变化
    const observer = new MutationObserver(resolveSlot)
    const container = globalThis.document?.body
    if (container) {
      observer.observe(container, { childList: true, subtree: true })
    }

    return () => {
      active = false
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [docId, collabEnabled])

  useEffect(() => {
    const handler = async (event: Event) => {
      const e = event as CustomEvent<{ docId?: string }>
      if (!e.detail?.docId || e.detail.docId !== docId) return
      if (!contentRef.current) return
      if (collabEnabled && localMyRole !== 'OWNER' && localMyRole !== 'EDITOR') return
      const seq = ++changeSeqRef.current
      setDirty(docId, true)
      await update(docId, { content: contentRef.current })
      if (changeSeqRef.current === seq) setDirty(docId, false)
    }
    window.addEventListener('thinksync:tab-save-request', handler)
    return () => window.removeEventListener('thinksync:tab-save-request', handler)
  }, [collabEnabled, docId, localMyRole, setDirty, update])

  // 初始化协同状态（文档切换或 token/user 准备好时执行）
  useEffect(() => {
    let canceled = false

    const init = async () => {
      // 切换文档时先重置本地状态
      setLocalRoomId(null)
      setLocalMyRole(null)
      setLocalIsOwner(false)
      setMembers([])

      // 如果没有 token 或 user，直接返回
      if (!token || !user) {
        return
      }

      // 处理邀请链接
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
          if (canceled) return
          setLocalRoomId(accepted.roomId)
          setLocalMyRole(accepted.role)
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

      // 检查该文档的协同状态
      const byDoc = await getRoomByDocument(docId)
      if (canceled) return

      // 只有 isCollabEnabled 为 true 时才进入协同
      if (byDoc.isCollabEnabled && byDoc.room && byDoc.myRole) {
        setLocalRoomId(byDoc.room.id)
        setLocalMyRole(byDoc.myRole)
      }
      // 设置文档所有者状态
      setLocalIsOwner(byDoc.isOwner)
    }

    init()

    return () => {
      canceled = true
    }
  }, [
    docId,
    token,
    user,
    inviteToken,
    acceptInvite,
    getRoom,
    getRoomByDocument,
    refetch,
    router,
    setLocalRoomId,
    setLocalMyRole,
    setLocalIsOwner,
    setMembers,
    setIsJoiningInvite,
    setJoinInviteError,
  ])

  // 协同连接管理
  useEffect(() => {
    if (!collabEnabled || !token || !user) {
      // 清理旧连接
      if (providerRef.current) {
        providerRef.current.destroy()
        providerRef.current = null
      }
      if (ydocRef.current) {
        ydocRef.current.destroy()
        ydocRef.current = null
      }
      setProvider(null)
      setYdoc(null)
      setPresence([])
      setStatus('disconnected')
      return
    }

    let canceled = false

    // 如果没有本地 roomId，不建立连接
    if (!localRoomId || !localMyRole) {
      return
    }

    const init = async () => {
      // 清理旧连接
      if (providerRef.current) {
        providerRef.current.destroy()
        providerRef.current = null
      }
      if (ydocRef.current) {
        ydocRef.current.destroy()
        ydocRef.current = null
      }

      const currentRoomId = localRoomId
      const role = localMyRole

      const memberResp = await getMembers(currentRoomId)
      if (canceled) return
      setMembers(
        memberResp.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          name: m.user.name,
        })),
      )

      const doc = new Y.Doc()
      ydocRef.current = doc

      const canEdit = () => role === 'OWNER' || role === 'EDITOR'
      const p = new CollabSocketProvider(
        doc,
        { baseUrl: API_BASE_URL, roomId: currentRoomId, token },
        canEdit,
      )
      providerRef.current = p

      const myName = user.name ?? user.email ?? 'User'
      const myColor = user.id ? colorFromString(user.id) : '#888888'
      p.awareness.setLocalStateField('user', { id: user.id, name: myName, color: myColor })

      const statusListener = (e: { status: 'connecting' | 'connected' | 'disconnected' }) => {
        if (canceled) return
        setStatus(e.status)
      }
      p.on('status', statusListener)

      const updatePresence = () => {
        if (canceled) return
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

      p.awareness.on('change', updatePresence)
      updatePresence()

      setProvider(p)
      setYdoc(doc)
    }

    init()

    return () => {
      canceled = true
      // 清理连接
      if (providerRef.current) {
        providerRef.current.destroy()
        providerRef.current = null
      }
      if (ydocRef.current) {
        ydocRef.current.destroy()
        ydocRef.current = null
      }
      setProvider(null)
      setYdoc(null)
      setPresence([])
      setStatus('disconnected')
    }
  }, [
    collabEnabled,
    token,
    user,
    localRoomId,
    localMyRole,
    getMembers,
    setProvider,
    setYdoc,
    setPresence,
    setMembers,
    setStatus,
  ])

  const onChange = async (content: string) => {
    contentRef.current = content
    setSharedContent(docId, content)
    const seq = ++changeSeqRef.current
    setDirty(docId, true)
    await update(docId, { content })
    if (changeSeqRef.current === seq) setDirty(docId, false)
  }

  const canEditCollab = localMyRole === 'OWNER' || localMyRole === 'EDITOR'
  const canInvite = collabEnabled && localMyRole === 'OWNER'

  const onToggleCollab = async () => {
    // 只有文档所有者可以切换协同状态
    if (!localIsOwner) return

    if (collabEnabled) {
      // 关闭协同
      await disableCollab(docId)
      const seed = contentRef.current ?? sharedContent ?? document?.content ?? null
      if (seed !== null) {
        contentRef.current = seed
        setSharedContent(docId, seed)
        setNonCollabSeed(seed)
        setNonCollabSeedKey((value) => value + 1)
      }
      // 重置本地状态
      setLocalRoomId(null)
      setLocalMyRole(null)
      setMembers([])
      resetCollab()
      return
    }
    // 开启协同：创建 Room
    const created = await createRoom({ documentId: docId })
    setLocalRoomId(created.id)
    setLocalMyRole('OWNER')

    const seed = contentRef.current ?? sharedContent ?? document?.content ?? null
    if (seed !== null) {
      contentRef.current = seed
      setSharedContent(docId, seed)
      setCollabSeed(seed)
      setCollabSeedKey((value) => value + 1)
    }
  }

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
          provider && ydoc && localMyRole && user ? (
            <RoomEditor
              ydoc={ydoc}
              provider={provider}
              editable={canEditCollab}
              user={{ name: myName, color: myColor }}
              initialContent={null}
              onChange={async (content: string) => {
                contentRef.current = content
                setSharedContent(docId, content)
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
    setSharedContent(docId, content)
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
  const collabControl = collabSlot
    ? createPortal(
        <CollabControl
          collabEnabled={collabEnabled}
          onToggleCollab={onToggleCollab}
          status={status}
          myRole={localMyRole}
          canEditCollab={canEditCollab}
          canInvite={canInvite}
          isOwner={localIsOwner}
          roomId={localRoomId}
          docId={docId}
          presence={presence}
          members={members}
        />,
        collabSlot,
      )
    : null

  return (
    <React.Fragment>
      {collabControl}
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
            provider && ydoc && localMyRole && user ? (
              <RoomEditor
                key={collabSeedKey}
                ydoc={ydoc}
                provider={provider}
                editable={canEditCollab}
                user={{ name: myName, color: myColor }}
                initialContent={collabSeed ?? sharedContent ?? document.content ?? null}
                onChange={onCollabChange}
              />
            ) : (
              <div className="px-8 py-6 text-sm text-muted-foreground">正在连接协同…</div>
            )
          ) : (
            <Editor
              key={nonCollabSeedKey}
              onChange={onChange}
              initialContent={nonCollabSeed ?? sharedContent ?? document.content}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default DocumentIdPage
