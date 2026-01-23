import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { RoomRole } from '@prisma/client'
import { randomBytes } from 'crypto'

import { PrismaService } from '../prisma/prisma.service'
import { CreateInviteDto } from './dto/create-invite.dto'
import { CreateRoomDto } from './dto/create-room.dto'

const createInviteToken = () => randomBytes(24).toString('base64url')

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireRoomMember(roomId: string, userId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })
    if (!member) {
      throw new ForbiddenException('Not a room member')
    }
    return member
  }

  private async requireOwner(roomId: string, userId: string) {
    const member = await this.requireRoomMember(roomId, userId)
    if (member.role !== RoomRole.OWNER) {
      throw new ForbiddenException('Only owner can perform this action')
    }
    return member
  }

  async createRoom(userId: string, dto: CreateRoomDto) {
    const document = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
      select: { id: true, title: true, userId: true, isCollabEnabled: true },
    })
    if (!document) {
      throw new NotFoundException('Document not found')
    }
    if (document.userId !== userId) {
      throw new ForbiddenException('Document does not belong to user')
    }

    const existing = await this.prisma.room.findUnique({
      where: { documentId: document.id },
    })
    if (existing) {
      const member = await this.prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId: existing.id, userId } },
        select: { id: true },
      })
      if (!member && existing.ownerId === userId) {
        await this.prisma.roomMember.create({
          data: { roomId: existing.id, userId, role: RoomRole.OWNER },
        })
      }
      // 确保 isCollabEnabled 为 true
      if (!document.isCollabEnabled) {
        await this.prisma.document.update({
          where: { id: document.id },
          data: { isCollabEnabled: true },
        })
      }
      return existing
    }

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          documentId: document.id,
          ownerId: userId,
          title: document.title,
          members: {
            create: {
              userId,
              role: RoomRole.OWNER,
            },
          },
        },
      })
      await tx.document.update({
        where: { id: document.id },
        data: { isCollabEnabled: true },
      })
      return room
    })
  }

  async getRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    })
    if (!room) {
      throw new NotFoundException('Room not found')
    }
    const member = await this.requireRoomMember(roomId, userId)
    return { room, myRole: member.role }
  }

  async getRoomByDocument(documentId: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true, isCollabEnabled: true },
    })
    if (!doc) {
      return { room: null, myRole: null, isCollabEnabled: false, isOwner: false }
    }
    const room = await this.prisma.room.findUnique({
      where: { documentId },
    })
    if (!room) {
      return {
        room: null,
        myRole: null,
        isCollabEnabled: doc.isCollabEnabled,
        isOwner: doc.userId === userId,
      }
    }
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
      select: { role: true },
    })
    return {
      room,
      myRole: member?.role ?? null,
      isCollabEnabled: doc.isCollabEnabled,
      isOwner: doc.userId === userId,
    }
  }

  async getMembers(roomId: string, userId: string) {
    await this.requireRoomMember(roomId, userId)
    const members = await this.prisma.roomMember.findMany({
      where: { roomId },
      orderBy: { joinedAt: 'asc' },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
    })
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }))
  }

  async createInvite(roomId: string, inviterId: string, dto: CreateInviteDto) {
    await this.requireOwner(roomId, inviterId)

    const token = createInviteToken()
    const invite = await this.prisma.roomInvite.create({
      data: {
        roomId,
        inviterId,
        token,
        role: dto.role,
        expiresAt: dto.expiresAt ?? null,
        maxUses: dto.maxUses ?? 1,
      },
    })
    return invite
  }

  async revokeInvite(roomId: string, inviteId: string, userId: string) {
    await this.requireOwner(roomId, userId)
    const invite = await this.prisma.roomInvite.findUnique({ where: { id: inviteId } })
    if (!invite || invite.roomId !== roomId) {
      throw new NotFoundException('Invite not found')
    }
    if (invite.revokedAt) {
      return invite
    }
    return this.prisma.roomInvite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() },
    })
  }

  async acceptInvite(token: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invite = await tx.roomInvite.findUnique({
        where: { token },
      })
      if (!invite) {
        throw new NotFoundException('Invite not found')
      }
      if (invite.revokedAt) {
        throw new BadRequestException('Invite revoked')
      }
      if (invite.expiresAt && invite.expiresAt.getTime() <= Date.now()) {
        throw new BadRequestException('Invite expired')
      }
      if (invite.usedCount >= invite.maxUses) {
        throw new BadRequestException('Invite already used up')
      }

      const existingMember = await tx.roomMember.findUnique({
        where: { roomId_userId: { roomId: invite.roomId, userId } },
      })
      if (existingMember) {
        return { roomId: invite.roomId, role: existingMember.role, alreadyMember: true }
      }

      const updated = await tx.roomInvite.updateMany({
        where: {
          id: invite.id,
          revokedAt: null,
          usedCount: { lt: invite.maxUses },
          ...(invite.expiresAt ? { expiresAt: { gt: new Date() } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      })
      if (updated.count !== 1) {
        throw new BadRequestException('Invite not available')
      }

      const member = await tx.roomMember.create({
        data: {
          roomId: invite.roomId,
          userId,
          role: invite.role,
        },
      })
      return { roomId: invite.roomId, role: member.role, alreadyMember: false }
    })
  }

  async getMyRole(roomId: string, userId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })
    if (!member) {
      throw new ForbiddenException('Not a room member')
    }
    return member.role
  }

  async listInvites(roomId: string, userId: string, limit: number) {
    await this.requireOwner(roomId, userId)
    const normalized = Math.max(1, Math.min(10, limit))
    return this.prisma.roomInvite.findMany({
      where: { roomId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: normalized,
    })
  }

  async updateMemberRole(roomId: string, memberId: string, userId: string, role: RoomRole) {
    await this.requireOwner(roomId, userId)
    const member = await this.prisma.roomMember.findUnique({ where: { id: memberId } })
    if (!member || member.roomId !== roomId) {
      throw new NotFoundException('Member not found')
    }
    if (member.role === RoomRole.OWNER) {
      throw new BadRequestException('Cannot change owner role')
    }
    if (role === RoomRole.OWNER) {
      throw new BadRequestException('Cannot assign owner role')
    }
    return this.prisma.roomMember.update({ where: { id: memberId }, data: { role } })
  }

  async removeMember(roomId: string, memberId: string, userId: string) {
    await this.requireOwner(roomId, userId)
    const member = await this.prisma.roomMember.findUnique({ where: { id: memberId } })
    if (!member || member.roomId !== roomId) {
      throw new NotFoundException('Member not found')
    }
    if (member.role === RoomRole.OWNER) {
      throw new BadRequestException('Cannot remove owner')
    }
    await this.prisma.roomMember.delete({ where: { id: memberId } })
    return { removed: true }
  }

  async disableCollab(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true, isCollabEnabled: true, room: true },
    })
    if (!document) {
      throw new NotFoundException('Document not found')
    }
    if (document.userId !== userId) {
      throw new ForbiddenException('Only owner can disable collab')
    }
    if (!document.isCollabEnabled) {
      return { disabled: true }
    }
    await this.prisma.document.update({
      where: { id: documentId },
      data: { isCollabEnabled: false },
    })
    return { disabled: true }
  }
}
