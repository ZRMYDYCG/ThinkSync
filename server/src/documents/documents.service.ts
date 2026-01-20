import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { basename, resolve } from 'path'

import { PrismaService } from '../prisma/prisma.service'
import { coversDir, uploadsRoot } from '../uploads/uploads-paths'
import { CreateDocumentDto } from './dto/create-document.dto'
import { UpdateDocumentDto } from './dto/update-document.dto'

const isWithinRoot = (candidate: string, root: string) => candidate.startsWith(root)

const resolveLocalFileCandidates = (url?: string | null) => {
  if (!url) return null
  let pathname = url
  if (url.startsWith('http')) {
    try {
      pathname = new URL(url).pathname
    } catch {
      return null
    }
  }
  const normalized = pathname.replace(/\\/g, '/')
  if (!normalized.startsWith('/uploads/')) {
    return null
  }
  const relativePath = normalized.replace(/^\/uploads\//, '')
  const candidates: string[] = []
  const primary = resolve(uploadsRoot, relativePath)
  if (isWithinRoot(primary, uploadsRoot)) {
    candidates.push(primary)
  }
  const legacyRoot = resolve(uploadsRoot, '..', '..', 'uploads')
  const legacy = resolve(legacyRoot, relativePath)
  if (isWithinRoot(legacy, legacyRoot)) {
    candidates.push(legacy)
  }
  return candidates.length > 0 ? candidates : null
}

const deleteLocalFile = async (url?: string | null) => {
  const candidates = resolveLocalFileCandidates(url)
  if (!candidates) {
    return
  }
  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue
    }
    try {
      await unlink(candidate)
    } catch {
      // best-effort cleanup
    }
  }
}

const extractFilename = (url?: string | null) => {
  if (!url) return null
  let pathname = url
  if (url.startsWith('http')) {
    try {
      pathname = new URL(url).pathname
    } catch {
      return null
    }
  }
  const normalized = pathname.replace(/\\/g, '/').split('?')[0]
  return basename(normalized)
}

const deleteCoverFile = async (url?: string | null) => {
  await deleteLocalFile(url)
  const filename = extractFilename(url)
  if (!filename) {
    return
  }
  const legacyCoversDir = resolve(uploadsRoot, '..', '..', 'uploads', 'covers')
  const candidates = [resolve(coversDir, filename), resolve(legacyCoversDir, filename)]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue
    }
    try {
      await unlink(candidate)
    } catch {
      // best-effort cleanup
    }
  }
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(documentId: string, userId?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!document) {
      throw new NotFoundException('Document not found')
    }
    if (document.isPublished && !document.isArchived) {
      return document
    }
    if (!userId) {
      throw new UnauthorizedException('Not authenticated')
    }
    if (document.userId !== userId) {
      throw new ForbiddenException('Document does not belong to user')
    }
    return document
  }

  async getSidebar(userId: string, parentDocumentId?: string) {
    return this.prisma.document.findMany({
      where: {
        userId,
        parentDocumentId: parentDocumentId ?? null,
        isArchived: false,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getSearch(userId: string) {
    return this.prisma.document.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getTrash(userId: string) {
    return this.prisma.document.findMany({
      where: {
        userId,
        isArchived: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(userId: string, dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        parentDocumentId: dto.parentDocumentId ?? null,
        userId,
        isPublished: false,
        isArchived: false,
      },
    })
  }

  async update(userId: string, documentId: string, dto: UpdateDocumentDto) {
    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!existing) {
      throw new NotFoundException('Not found')
    }
    if (!userId) {
      throw new UnauthorizedException('Not authenticated')
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Document does not belong to user')
    }
    const shouldReplaceCover =
      dto.coverImage !== undefined && dto.coverImage !== existing.coverImage
    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        title: dto.title,
        content: dto.content,
        coverImage: dto.coverImage,
        coverPosition: dto.coverPosition,
        icon: dto.icon,
        isPublished: dto.isPublished,
      },
    })
    if (shouldReplaceCover) {
      await deleteCoverFile(existing.coverImage)
    }
    return updated
  }

  private async getDescendants(userId: string, rootId: string) {
    const ids: string[] = []
    const stack = [rootId]
    while (stack.length > 0) {
      const currentId = stack.pop() as string
      const children = await this.prisma.document.findMany({
        where: { userId, parentDocumentId: currentId },
        select: { id: true },
      })
      for (const child of children) {
        ids.push(child.id)
        stack.push(child.id)
      }
    }
    return ids
  }

  async archive(userId: string, documentId: string) {
    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!existing) {
      throw new NotFoundException('Document not found')
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Document does not belong to user')
    }
    const descendantIds = await this.getDescendants(userId, documentId)
    await this.prisma.document.updateMany({
      where: { id: { in: descendantIds } },
      data: { isArchived: true },
    })
    return this.prisma.document.update({
      where: { id: documentId },
      data: { isArchived: true },
    })
  }

  async restore(userId: string, documentId: string) {
    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!existing) {
      throw new NotFoundException('Document not found')
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Document does not belong to user')
    }
    let parentDocumentId = existing.parentDocumentId
    if (parentDocumentId) {
      const parent = await this.prisma.document.findUnique({
        where: { id: parentDocumentId },
        select: { isArchived: true },
      })
      if (parent?.isArchived) {
        parentDocumentId = null
      }
    }
    const descendantIds = await this.getDescendants(userId, documentId)
    await this.prisma.document.updateMany({
      where: { id: { in: descendantIds } },
      data: { isArchived: false },
    })
    return this.prisma.document.update({
      where: { id: documentId },
      data: { isArchived: false, parentDocumentId },
    })
  }

  async remove(userId: string, documentId: string) {
    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!existing) {
      throw new NotFoundException('Document not found')
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Document does not belong to user')
    }
    return this.prisma.document.delete({ where: { id: documentId } })
  }

  async removeIcon(userId: string, documentId: string) {
    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!existing) {
      throw new NotFoundException('Not found')
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Not authenticated')
    }
    return this.prisma.document.update({
      where: { id: documentId },
      data: { icon: null },
    })
  }

  async removeCoverImage(userId: string, documentId: string) {
    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!existing) {
      throw new NotFoundException('Not found')
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Not authenticated')
    }
    await deleteCoverFile(existing.coverImage)
    return this.prisma.document.update({
      where: { id: documentId },
      data: { coverImage: null, coverPosition: null },
    })
  }
}
