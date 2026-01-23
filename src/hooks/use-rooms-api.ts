import { useCallback } from 'react'

import { Room, RoomInvite, RoomMember, RoomRole } from '@/types/room'

import { useRequest } from './use-request'

type CreateRoomPayload = {
  documentId: string
}

type CreateInvitePayload = {
  role: RoomRole
  expiresAt?: string
  maxUses?: number
}

type GetRoomResponse = {
  room: Room
  myRole: RoomRole
}

type GetRoomByDocumentResponse = {
  room: Room | null
  myRole: RoomRole | null
  isCollabEnabled: boolean
  isOwner: boolean
}

type AcceptInviteResponse = {
  roomId: string
  role: RoomRole
  alreadyMember: boolean
}

export const useRoomsApi = () => {
  const { request } = useRequest()

  const createRoom = useCallback(
    (payload: CreateRoomPayload) =>
      request<Room>('/rooms', {
        method: 'POST',
        body: payload,
      }),
    [request],
  )

  const getRoom = useCallback(
    (roomId: string) => request<GetRoomResponse>(`/rooms/${roomId}`),
    [request],
  )

  const getRoomByDocument = useCallback(
    (documentId: string) => request<GetRoomByDocumentResponse>(`/rooms/by-document/${documentId}`),
    [request],
  )

  const getMembers = useCallback(
    (roomId: string) => request<RoomMember[]>(`/rooms/${roomId}/members`),
    [request],
  )

  const createInvite = useCallback(
    (roomId: string, payload: CreateInvitePayload) =>
      request<RoomInvite>(`/rooms/${roomId}/invites`, {
        method: 'POST',
        body: payload,
      }),
    [request],
  )

  const acceptInvite = useCallback(
    (token: string) =>
      request<AcceptInviteResponse>(`/invites/${token}/accept`, { method: 'POST' }),
    [request],
  )

  const revokeInvite = useCallback(
    (roomId: string, inviteId: string) =>
      request<RoomInvite>(`/rooms/${roomId}/invites/${inviteId}/revoke`, { method: 'POST' }),
    [request],
  )

  const listInvites = useCallback(
    (roomId: string, limit?: number) =>
      request<RoomInvite[]>(`/rooms/${roomId}/invites`, { params: limit ? { limit } : undefined }),
    [request],
  )

  const disableCollab = useCallback(
    (documentId: string) =>
      request<{ disabled: true }>(`/documents/${documentId}/disable-collab`, { method: 'POST' }),
    [request],
  )

  return {
    createRoom,
    getRoom,
    getRoomByDocument,
    getMembers,
    createInvite,
    acceptInvite,
    revokeInvite,
    listInvites,
    disableCollab,
  }
}
