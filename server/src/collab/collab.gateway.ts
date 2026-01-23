import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { RoomRole } from '@prisma/client'
import { Server, Socket } from 'socket.io'
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness'

import { PrismaService } from '../prisma/prisma.service'
import { CollabService } from './collab.service'

type SocketData = {
  userId?: string
  roomId?: string
  role?: RoomRole
  clientId?: number
}

type AuthedSocket = Socket & { data: SocketData }

const asUint8Array = (value: unknown) => {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  if (Array.isArray(value) && value.every((item) => typeof item === 'number')) {
    return new Uint8Array(value)
  }
  if (value && typeof value === 'object') {
    const candidate = value as { type?: string; data?: unknown }
    if (candidate.type === 'Buffer' && Array.isArray(candidate.data)) {
      return new Uint8Array(candidate.data as number[])
    }
    if (Array.isArray(candidate.data) && candidate.data.every((item) => typeof item === 'number')) {
      return new Uint8Array(candidate.data as number[])
    }
  }
  return null
}

@WebSocketGateway({
  namespace: '/collab',
  cors: { origin: true, credentials: true },
})
export class CollabGateway {
  private readonly logger = new Logger(CollabGateway.name)

  @WebSocketServer()
  server!: Server

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly collabService: CollabService,
  ) {}

  private roomChannel(roomId: string) {
    return `room:${roomId}`
  }

  private extractToken(client: Socket) {
    const tokenFromAuth = (client.handshake.auth as any)?.token as string | undefined
    if (tokenFromAuth) return tokenFromAuth

    const header =
      (client.handshake.headers?.authorization as string | undefined) ??
      (client.handshake.headers?.Authorization as string | undefined)
    if (header && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length)
    }
    return undefined
  }

  private extractRoomId(client: Socket) {
    const q = client.handshake.query as Record<string, unknown>
    const roomId = q?.roomId
    return typeof roomId === 'string' && roomId.length > 0 ? roomId : undefined
  }

  async handleConnection(client: AuthedSocket) {
    try {
      const token = this.extractToken(client)
      const roomId = this.extractRoomId(client)
      if (!token || !roomId) {
        client.emit('collab:error', { message: 'Missing token or roomId' })
        client.disconnect()
        return
      }

      const payload = await this.jwtService.verifyAsync(token)
      const userId = (payload?.sub as string | undefined) ?? null
      if (!userId) {
        client.emit('collab:error', { message: 'Invalid token' })
        client.disconnect()
        return
      }

      const member = await this.prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId } },
        select: { role: true },
      })
      if (!member) {
        client.emit('collab:error', { message: 'Not a room member' })
        client.disconnect()
        return
      }

      client.data.userId = userId
      client.data.roomId = roomId
      client.data.role = member.role

      await client.join(this.roomChannel(roomId))

      const { update, seq } = await this.collabService.encodeFullState(roomId)
      client.emit('sync:state', { update: Buffer.from(update), seq, role: member.role })

      const runtime = await this.collabService.getRuntime(roomId)
      const clientIds = Array.from(runtime.awareness.getStates().keys())
      if (clientIds.length > 0) {
        client.emit('awareness:update', {
          update: Buffer.from(encodeAwarenessUpdate(runtime.awareness, clientIds)),
        })
      }

      this.logger.log(`Client connected room=${roomId} user=${userId}`)
    } catch (e) {
      this.logger.error('Failed to accept socket connection', e as Error)
      client.emit('collab:error', { message: 'Connection failed' })
      client.disconnect()
    }
  }

  async handleDisconnect(client: AuthedSocket) {
    const roomId = client.data.roomId
    const userId = client.data.userId
    let clientId = client.data.clientId

    if (!roomId) {
      return
    }

    try {
      const runtime = await this.collabService.getRuntime(roomId)
      const beforeStates = runtime.awareness.getStates().size

      // 找到所有属于该用户的 awareness states（可能有多个 stale clientIds）
      const staleClientIds: number[] = []
      if (clientId !== undefined && runtime.awareness.getStates().has(clientId)) {
        staleClientIds.push(clientId)
      }

      // 如果没有找到 clientId 或状态不存在，尝试通过 userId 查找所有匹配的
      if (staleClientIds.length === 0 && userId) {
        for (const [cid, state] of runtime.awareness.getStates()) {
          if (state?.user?.id === userId) {
            staleClientIds.push(cid)
          }
        }
      }

      if (staleClientIds.length === 0) {
        this.logger.warn(
          `No awareness states found to remove room=${roomId} user=${userId} clientId=${clientId}`,
        )
        return
      }

      // 移除该用户的所有 stale awareness states
      removeAwarenessStates(runtime.awareness, staleClientIds, this)

      // 广播移除更新给房间内其他用户
      const update = Buffer.from(encodeAwarenessUpdate(runtime.awareness, staleClientIds))
      client.to(this.roomChannel(roomId)).emit('awareness:update', { update })

      const afterStates = runtime.awareness.getStates().size
      this.logger.log(
        `Client disconnected room=${roomId} user=${userId} clientIds=${staleClientIds.join(',')} states=${beforeStates}->${afterStates}`,
      )
    } catch (e) {
      this.logger.error('Failed to cleanup awareness on disconnect', e as Error)
    }
  }

  async onModuleInit() {
    // noop
  }

  async onApplicationShutdown() {
    // noop
  }

  afterInit() {
    // noop
  }

  @SubscribeMessage('hello')
  onHello(client: AuthedSocket, payload: { clientId: number }) {
    if (typeof payload?.clientId === 'number') {
      client.data.clientId = payload.clientId
    }
  }

  @SubscribeMessage('doc:update')
  async onDocUpdate(client: AuthedSocket, payload: { update: unknown }) {
    const roomId = client.data.roomId
    const role = client.data.role
    if (!roomId || !role) {
      client.emit('collab:error', { message: 'Not initialized' })
      return
    }
    if (role === RoomRole.VIEWER) {
      client.emit('doc:error', { message: 'VIEWER cannot edit' })
      return
    }
    const update = asUint8Array(payload?.update)
    if (!update || update.length === 0) {
      client.emit('doc:error', { message: 'Invalid update' })
      try {
        const { update: fullUpdate, seq } = await this.collabService.encodeFullState(roomId)
        client.emit('sync:state', { update: Buffer.from(fullUpdate), seq })
      } catch (syncError) {
        this.logger.error(`Failed to resync room=${roomId}`, syncError as Error)
      }
      return
    }

    try {
      const { seq } = await this.collabService.appendUpdate(roomId, update)
      client.to(this.roomChannel(roomId)).emit('doc:update', { seq, update: Buffer.from(update) })
      client.emit('doc:ack', { seq })
    } catch (e) {
      this.logger.error(`Failed to persist update room=${roomId}`, e as Error)
      client.emit('doc:error', { message: 'Persist failed' })
      try {
        const { update: fullUpdate, seq } = await this.collabService.encodeFullState(roomId)
        this.server
          .to(this.roomChannel(roomId))
          .emit('sync:state', { update: Buffer.from(fullUpdate), seq })
      } catch (syncError) {
        this.logger.error(`Failed to resync room=${roomId}`, syncError as Error)
      }
    }
  }

  @SubscribeMessage('awareness:update')
  async onAwarenessUpdate(client: AuthedSocket, payload: { update: unknown }) {
    const roomId = client.data.roomId
    if (!roomId) {
      return
    }
    const update = asUint8Array(payload?.update)
    if (!update || update.length === 0) {
      return
    }
    try {
      const runtime = await this.collabService.getRuntime(roomId)
      applyAwarenessUpdate(runtime.awareness, update, this)

      const inferredIds = Array.from(runtime.awareness.getStates().keys())
      if (client.data.clientId === undefined && inferredIds.length > 0) {
        const last = inferredIds[inferredIds.length - 1]
        client.data.clientId = last
      }

      client.to(this.roomChannel(roomId)).emit('awareness:update', { update: Buffer.from(update) })
    } catch (e) {
      this.logger.error(`Failed to handle awareness update room=${roomId}`, e as Error)
    }
  }
}
