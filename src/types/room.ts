export type RoomRole = 'OWNER' | 'EDITOR' | 'VIEWER'

export type Room = {
  id: string
  documentId: string
  ownerId: string
  title: string
  createdAt: string
  updatedAt: string
}

export type RoomMember = {
  id: string
  userId: string
  role: RoomRole
  joinedAt: string
  user: {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
  }
}

export type RoomInvite = {
  id: string
  roomId: string
  inviterId: string
  token: string
  role: RoomRole
  expiresAt: string | null
  maxUses: number
  usedCount: number
  revokedAt: string | null
  createdAt: string
}
