import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional.guard'
import { CreateFlashThoughtCommentDto } from './dto/create-flash-thought-comment.dto'
import { CreateFlashThoughtDto } from './dto/create-flash-thought.dto'
import { FlashThoughtResponse, FlashThoughtsService } from './flash-thoughts.service'

type AuthRequest = Request & { user?: { userId: string; email: string } }

@Controller('flash-thoughts')
export class FlashThoughtsController {
  constructor(private readonly flashThoughtsService: FlashThoughtsService) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async list(
    @Req() req: AuthRequest,
    @Query('filter') filter?: string,
  ): Promise<FlashThoughtResponse[]> {
    return this.flashThoughtsService.list(filter, req.user?.userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateFlashThoughtDto,
  ): Promise<FlashThoughtResponse> {
    return this.flashThoughtsService.create(req.user?.userId ?? '', dto)
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.flashThoughtsService.toggleLike(req.user?.userId ?? '', id)
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: CreateFlashThoughtCommentDto,
  ) {
    return this.flashThoughtsService.addComment(req.user?.userId ?? '', id, dto)
  }
}
