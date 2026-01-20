import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { extname } from 'path'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional.guard'
import { coversDir } from '../uploads/uploads-paths'
import { DocumentsService } from './documents.service'
import { CreateDocumentDto } from './dto/create-document.dto'
import { UpdateDocumentDto } from './dto/update-document.dto'

type AuthRequest = Request & { user?: { userId: string; email: string } }

const coverStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!existsSync(coversDir)) {
      mkdirSync(coversDir, { recursive: true })
    }
    cb(null, coversDir)
  },
  filename: (_req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
    cb(null, uniqueName)
  },
})

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestException('Only image files are allowed'), false)
    return
  }
  cb(null, true)
}

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async getSearch(@Req() req: AuthRequest) {
    return this.documentsService.getSearch(req.user?.userId ?? '')
  }

  @Get('trash')
  @UseGuards(JwtAuthGuard)
  async getTrash(@Req() req: AuthRequest) {
    return this.documentsService.getTrash(req.user?.userId ?? '')
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSidebar(@Req() req: AuthRequest, @Query('parentDocumentId') parentDocumentId?: string) {
    return this.documentsService.getSidebar(req.user?.userId ?? '', parentDocumentId)
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.documentsService.getById(id, req.user?.userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: AuthRequest, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(req.user?.userId ?? '', dto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(req.user?.userId ?? '', id, dto)
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  async archive(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.documentsService.archive(req.user?.userId ?? '', id)
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard)
  async restore(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.documentsService.restore(req.user?.userId ?? '', id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.documentsService.remove(req.user?.userId ?? '', id)
  }

  @Post(':id/remove-icon')
  @UseGuards(JwtAuthGuard)
  async removeIcon(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.documentsService.removeIcon(req.user?.userId ?? '', id)
  }

  @Post(':id/remove-cover')
  @UseGuards(JwtAuthGuard)
  async removeCover(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.documentsService.removeCoverImage(req.user?.userId ?? '', id)
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: coverStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCover(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Not authenticated')
    }
    if (!file) {
      throw new BadRequestException('Cover file is required')
    }
    const coverImage = `/uploads/covers/${file.filename}`
    return this.documentsService.update(req.user.userId, id, { coverImage })
  }
}
