import { Injectable, Logger } from '@nestjs/common'
import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'

import { PrismaService } from '../prisma/prisma.service'

type RoomRuntime = {
  ydoc: Y.Doc
  awareness: Awareness
  lastSeq: number
}

@Injectable()
export class CollabService {
  private readonly logger = new Logger(CollabService.name)
  private readonly runtimes = new Map<string, Promise<RoomRuntime>>()
  private readonly locks = new Map<string, Promise<unknown>>()
  private readonly snapshotEveryNUpdates = 100

  constructor(private readonly prisma: PrismaService) {}

  private withRoomLock<T>(roomId: string, fn: () => Promise<T>): Promise<T> {
    const current = this.locks.get(roomId) ?? Promise.resolve()
    const next = current.catch(() => undefined).then(fn)
    this.locks.set(
      roomId,
      next.then(() => undefined),
    )
    return next
  }

  async getRuntime(roomId: string) {
    const existing = this.runtimes.get(roomId)
    if (existing) {
      return existing
    }

    const loader = this.withRoomLock(roomId, async () => {
      const ydoc = new Y.Doc()
      let lastSeq = 0

      const snapshot = await this.prisma.collabSnapshot.findUnique({
        where: { roomId },
      })
      if (snapshot) {
        try {
          Y.applyUpdate(ydoc, new Uint8Array(snapshot.state))
          lastSeq = snapshot.seq
        } catch (e) {
          this.logger.error(`Failed to apply snapshot for room ${roomId}`, e as Error)
        }
      }

      const updates = await this.prisma.collabUpdate.findMany({
        where: { roomId, seq: { gt: lastSeq } },
        orderBy: { seq: 'asc' },
        select: { seq: true, update: true },
      })

      for (const u of updates) {
        try {
          Y.applyUpdate(ydoc, new Uint8Array(u.update))
          lastSeq = u.seq
        } catch (e) {
          this.logger.error(`Failed to apply update seq=${u.seq} for room ${roomId}`, e as Error)
        }
      }

      const awareness = new Awareness(ydoc)
      return { ydoc, awareness, lastSeq }
    })
      .then((runtime) => runtime)
      .catch((e) => {
        this.runtimes.delete(roomId)
        throw e
      })

    this.runtimes.set(roomId, loader)
    return loader
  }

  async encodeFullState(roomId: string) {
    const runtime = await this.getRuntime(roomId)
    return { update: Y.encodeStateAsUpdate(runtime.ydoc), seq: runtime.lastSeq }
  }

  async appendUpdate(roomId: string, update: Uint8Array) {
    return this.withRoomLock(roomId, async () => {
      const runtime = await this.getRuntime(roomId)
      const nextSeq = runtime.lastSeq + 1

      Y.applyUpdate(runtime.ydoc, update)

      await this.prisma.collabUpdate.create({
        data: {
          roomId,
          seq: nextSeq,
          update: Buffer.from(update),
        },
      })

      runtime.lastSeq = nextSeq

      if (nextSeq % this.snapshotEveryNUpdates === 0) {
        const state = Y.encodeStateAsUpdate(runtime.ydoc)
        await this.prisma.collabSnapshot.upsert({
          where: { roomId },
          create: { roomId, seq: nextSeq, state: Buffer.from(state) },
          update: { seq: nextSeq, state: Buffer.from(state) },
        })
      }

      return { seq: nextSeq }
    })
  }
}
