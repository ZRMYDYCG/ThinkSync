import { io, Socket } from 'socket.io-client'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'

type Status = 'connecting' | 'connected' | 'disconnected'
type StatusEvent = { status: Status }

type EventName = 'status' | 'sync'

type ListenerMap = {
  status: (event: StatusEvent) => void
  sync: (isSynced: boolean) => void
}

type Options = {
  baseUrl: string
  roomId: string
  token: string
}

const asUint8Array = (value: unknown) => {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  return null
}

export class CollabSocketProvider {
  private readonly socket: Socket
  private readonly listeners: Partial<Record<EventName, Set<ListenerMap[EventName]>>> = {}
  private isApplyingRemoteUpdate = false
  readonly awareness: Awareness
  private readonly ydocUpdateHandler: (update: Uint8Array, origin: unknown) => void
  private readonly awarenessUpdateHandler: (args: {
    added: number[]
    updated: number[]
    removed: number[]
  }) => void

  constructor(
    private readonly ydoc: Y.Doc,
    private readonly options: Options,
    private readonly canEdit: () => boolean,
  ) {
    this.awareness = new Awareness(ydoc)

    const url = new URL('/collab', options.baseUrl).toString()
    this.socket = io(url, {
      transports: ['websocket'],
      query: { roomId: options.roomId },
      auth: { token: options.token },
      autoConnect: true,
    })

    this.emit('status', { status: 'connecting' })

    this.socket.on('connect', () => {
      this.emit('status', { status: 'connected' })
      this.socket.emit('hello', { clientId: this.awareness.clientID })
    })

    this.socket.on('disconnect', () => {
      this.emit('status', { status: 'disconnected' })
    })

    this.socket.on('sync:state', (payload: { update: unknown }) => {
      const update = asUint8Array(payload?.update)
      if (!update) return
      this.isApplyingRemoteUpdate = true
      try {
        Y.applyUpdate(this.ydoc, update, this)
      } finally {
        this.isApplyingRemoteUpdate = false
      }
      this.emit('sync', true)
    })

    this.socket.on('doc:update', (payload: { update: unknown }) => {
      const update = asUint8Array(payload?.update)
      if (!update) return
      this.isApplyingRemoteUpdate = true
      try {
        Y.applyUpdate(this.ydoc, update, this)
      } finally {
        this.isApplyingRemoteUpdate = false
      }
    })

    this.socket.on('awareness:update', (payload: { update: unknown }) => {
      const update = asUint8Array(payload?.update)
      if (!update) return
      applyAwarenessUpdate(this.awareness, update, this)
    })

    this.ydocUpdateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === this || this.isApplyingRemoteUpdate) return
      if (!this.canEdit()) return
      this.socket.emit('doc:update', { update })
    }
    this.ydoc.on('update', this.ydocUpdateHandler)

    this.awarenessUpdateHandler = ({ added, updated, removed }) => {
      const changed = added.concat(updated).concat(removed)
      if (changed.length === 0) return
      const update = encodeAwarenessUpdate(this.awareness, changed)
      this.socket.emit('awareness:update', { update })
    }
    this.awareness.on('update', this.awarenessUpdateHandler)
  }

  on<E extends EventName>(event: E, listener: ListenerMap[E]) {
    const set = (this.listeners[event] ??= new Set())
    set.add(listener as any)
  }

  off<E extends EventName>(event: E, listener: ListenerMap[E]) {
    const set = this.listeners[event]
    set?.delete(listener as any)
  }

  private emit<E extends EventName>(event: E, payload: Parameters<ListenerMap[E]>[0]) {
    const set = this.listeners[event]
    if (!set || set.size === 0) return
    for (const listener of set) {
      ;(listener as any)(payload)
    }
  }

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  destroy() {
    this.ydoc.off('update', this.ydocUpdateHandler)
    this.awareness.off('update', this.awarenessUpdateHandler)
    this.awareness.destroy()
    this.socket.disconnect()
    this.socket.removeAllListeners()
  }
}
