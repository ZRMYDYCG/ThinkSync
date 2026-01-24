import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { CreateFlashThoughtCommentDto } from './dto/create-flash-thought-comment.dto'
import { CreateFlashThoughtDto } from './dto/create-flash-thought.dto'

export type FlashThoughtCommentNode = {
  id: string
  authorName: string
  authorAvatar: string | null
  content: string
  createdAt: string
  replies: FlashThoughtCommentNode[]
}

export type FlashThoughtResponse = {
  id: string
  authorName: string
  authorAvatar: string | null
  content: string
  images: string[]
  createdAt: string
  likedByMe: boolean
  likeCount: number
  comments: FlashThoughtCommentNode[]
}

const toAuthor = (user: { name: string | null; email: string; avatarUrl: string | null }) => ({
  authorName: user.name ?? user.email ?? 'Anonymous',
  authorAvatar: user.avatarUrl ?? null,
})

const sortByCreatedDesc = (a: { createdAt: string }, b: { createdAt: string }) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

@Injectable()
export class FlashThoughtsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureUser(userId?: string | null) {
    if (!userId) {
      throw new UnauthorizedException('Not authenticated')
    }
    return userId
  }

  private buildCommentTree(
    comments: Array<{
      id: string
      thoughtId: string
      parentId: string | null
      content: string
      createdAt: Date
      user: { name: string | null; email: string; avatarUrl: string | null }
    }>,
  ) {
    const commentNodes = new Map<string, FlashThoughtCommentNode>()
    const rootsByThoughtId = new Map<string, FlashThoughtCommentNode[]>()
    const childrenByParentId = new Map<string, FlashThoughtCommentNode[]>()

    for (const comment of comments) {
      const author = toAuthor(comment.user)
      const node: FlashThoughtCommentNode = {
        id: comment.id,
        authorName: author.authorName,
        authorAvatar: author.authorAvatar,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        replies: [],
      }
      commentNodes.set(comment.id, node)
      if (comment.parentId) {
        const siblings = childrenByParentId.get(comment.parentId) ?? []
        siblings.push(node)
        childrenByParentId.set(comment.parentId, siblings)
      } else {
        const roots = rootsByThoughtId.get(comment.thoughtId) ?? []
        roots.push(node)
        rootsByThoughtId.set(comment.thoughtId, roots)
      }
    }

    for (const [parentId, children] of childrenByParentId.entries()) {
      const parent = commentNodes.get(parentId)
      if (!parent) {
        continue
      }
      parent.replies = children.toSorted(sortByCreatedDesc)
    }

    for (const [thoughtId, roots] of rootsByThoughtId.entries()) {
      rootsByThoughtId.set(thoughtId, roots.toSorted(sortByCreatedDesc))
    }

    return rootsByThoughtId
  }

  async list(filter: string | undefined, userId?: string | null): Promise<FlashThoughtResponse[]> {
    const safeFilter = filter === 'mine' || filter === 'following' ? filter : 'all'
    const where: Prisma.FlashThoughtWhereInput = {}

    if (safeFilter === 'mine') {
      where.userId = this.ensureUser(userId)
    } else if (safeFilter === 'following') {
      const currentUserId = this.ensureUser(userId)
      where.NOT = { userId: currentUserId }
    }

    const thoughts = await this.prisma.flashThought.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        images: { orderBy: { order: 'asc' }, select: { url: true, order: true } },
        _count: { select: { likes: true } },
        ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    if (thoughts.length === 0) {
      return []
    }

    const thoughtIds = thoughts.map((thought) => thought.id)
    const comments = await this.prisma.flashThoughtComment.findMany({
      where: { thoughtId: { in: thoughtIds } },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
    const commentTreeByThoughtId = this.buildCommentTree(comments)

    return thoughts.map((thought) => {
      const author = toAuthor(thought.user)
      return {
        id: thought.id,
        authorName: author.authorName,
        authorAvatar: author.authorAvatar,
        content: thought.content,
        images: thought.images.map((image) => image.url),
        createdAt: thought.createdAt.toISOString(),
        likedByMe: userId ? (thought.likes?.length ?? 0) > 0 : false,
        likeCount: thought._count.likes,
        comments: commentTreeByThoughtId.get(thought.id) ?? [],
      }
    })
  }

  async create(userId: string, dto: CreateFlashThoughtDto): Promise<FlashThoughtResponse> {
    const currentUserId = this.ensureUser(userId)
    const images = dto.images?.map((url, index) => ({ url, order: index })) ?? []
    const data: Prisma.FlashThoughtCreateInput = {
      content: dto.content.trim(),
      user: { connect: { id: currentUserId } },
      ...(images.length > 0 ? { images: { createMany: { data: images } } } : {}),
    }
    const created = await this.prisma.flashThought.create({
      data,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        images: { orderBy: { order: 'asc' }, select: { url: true } },
      },
    })
    const author = toAuthor(created.user)
    return {
      id: created.id,
      authorName: author.authorName,
      authorAvatar: author.authorAvatar,
      content: created.content,
      images: created.images.map((image) => image.url),
      createdAt: created.createdAt.toISOString(),
      likedByMe: false,
      likeCount: 0,
      comments: [],
    }
  }

  async toggleLike(userId: string, thoughtId: string) {
    const currentUserId = this.ensureUser(userId)
    const thought = await this.prisma.flashThought.findUnique({
      where: { id: thoughtId },
      select: { id: true },
    })
    if (!thought) {
      throw new NotFoundException('Flash thought not found')
    }
    const existing = await this.prisma.flashThoughtLike.findUnique({
      where: { thoughtId_userId: { thoughtId, userId: currentUserId } },
      select: { id: true },
    })
    let likedByMe = false
    if (existing) {
      await this.prisma.flashThoughtLike.delete({ where: { id: existing.id } })
      likedByMe = false
    } else {
      await this.prisma.flashThoughtLike.create({
        data: { thoughtId, userId: currentUserId },
      })
      likedByMe = true
    }
    const likeCount = await this.prisma.flashThoughtLike.count({ where: { thoughtId } })
    return { likedByMe, likeCount }
  }

  async addComment(userId: string, thoughtId: string, dto: CreateFlashThoughtCommentDto) {
    const currentUserId = this.ensureUser(userId)
    const thought = await this.prisma.flashThought.findUnique({
      where: { id: thoughtId },
      select: { id: true },
    })
    if (!thought) {
      throw new NotFoundException('Flash thought not found')
    }
    if (dto.parentId) {
      const parent = await this.prisma.flashThoughtComment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, thoughtId: true },
      })
      if (!parent) {
        throw new NotFoundException('Comment not found')
      }
      if (parent.thoughtId !== thoughtId) {
        throw new BadRequestException('Comment does not belong to flash thought')
      }
    }
    const created = await this.prisma.flashThoughtComment.create({
      data: {
        thoughtId,
        userId: currentUserId,
        content: dto.content.trim(),
        parentId: dto.parentId ?? null,
      },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
    })
    const author = toAuthor(created.user)
    return {
      id: created.id,
      authorName: author.authorName,
      authorAvatar: author.authorAvatar,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      replies: [],
    }
  }
}
