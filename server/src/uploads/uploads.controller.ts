import {
  BadRequestException,
  Controller,
  Post,
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
import { imagesDir } from './uploads-paths'

const imageStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true })
    }
    cb(null, imagesDir)
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

@Controller('uploads')
export class UploadsController {
  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required')
    }
    return { url: `/uploads/images/${file.filename}` }
  }
}
