import { create } from 'zustand'

import { RoomRole } from '@/types/room'

export type CollabStatus = 'connecting' | 'connected' | 'disconnected'

export type Presence = {
  clientId: number
  userId?: string
  name?: string
  color?: string
}

export type Member = {
  id: string
  userId: string
  role: RoomRole
  name: string | null
}

type CollabState = {
  // 协同开关状态
  collabEnabled: boolean
  // 房间信息
  roomId: string | null
  myRole: RoomRole | null
  // 连接状态
  status: CollabStatus
  // 在线用户
  presence: Presence[]
  // 房间成员
  members: Member[]
  contentByDoc: Record<string, string | null>
  // Actions
  setCollabEnabled: (enabled: boolean) => void
  setRoomId: (id: string | null) => void
  setMyRole: (role: RoomRole | null) => void
  setStatus: (status: CollabStatus) => void
  setPresence: (presence: Presence[]) => void
  setMembers: (members: Member[]) => void
  setContent: (docId: string, content: string | null) => void
  reset: () => void
}

export const useCollabStore = create<CollabState>((set) => ({
  collabEnabled: false,
  roomId: null,
  myRole: null,
  status: 'disconnected',
  presence: [],
  members: [],
  contentByDoc: {},

  setCollabEnabled: (enabled) => set({ collabEnabled: enabled }),
  setRoomId: (id) => set({ roomId: id }),
  setMyRole: (role) => set({ myRole: role }),
  setStatus: (status) => set({ status }),
  setPresence: (presence) => set({ presence }),
  setMembers: (members) => set({ members }),
  setContent: (docId, content) =>
    set((state) => ({ contentByDoc: { ...state.contentByDoc, [docId]: content } })),

  reset: () =>
    set({
      collabEnabled: false,
      roomId: null,
      myRole: null,
      status: 'disconnected',
      presence: [],
      members: [],
    }),
}))
