import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateInviteDto } from './dto/create-invite.dto'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { RoomsService } from './rooms.service'

type AuthRequest = Request & { user?: { userId: string; email: string } }

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('rooms')
  @UseGuards(JwtAuthGuard)
  async createRoom(@Req() req: AuthRequest, @Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(req.user?.userId ?? '', dto)
  }

  @Get('rooms/:roomId')
  @UseGuards(JwtAuthGuard)
  async getRoom(@Req() req: AuthRequest, @Param('roomId') roomId: string) {
    return this.roomsService.getRoom(roomId, req.user?.userId ?? '')
  }

  @Get('rooms/by-document/:documentId')
  @UseGuards(JwtAuthGuard)
  async getRoomByDocument(@Req() req: AuthRequest, @Param('documentId') documentId: string) {
    return this.roomsService.getRoomByDocument(documentId, req.user?.userId ?? '')
  }

  @Get('rooms/:roomId/members')
  @UseGuards(JwtAuthGuard)
  async getMembers(@Req() req: AuthRequest, @Param('roomId') roomId: string) {
    return this.roomsService.getMembers(roomId, req.user?.userId ?? '')
  }

  @Patch('rooms/:roomId/members/:memberId')
  @UseGuards(JwtAuthGuard)
  async updateMemberRole(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.roomsService.updateMemberRole(roomId, memberId, req.user?.userId ?? '', dto.role)
  }

  @Delete('rooms/:roomId/members/:memberId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.roomsService.removeMember(roomId, memberId, req.user?.userId ?? '')
  }

  @Post('rooms/:roomId/invites')
  @UseGuards(JwtAuthGuard)
  async createInvite(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.roomsService.createInvite(roomId, req.user?.userId ?? '', dto)
  }

  @Post('invites/:token/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvite(@Req() req: AuthRequest, @Param('token') token: string) {
    return this.roomsService.acceptInvite(token, req.user?.userId ?? '')
  }

  @Post('rooms/:roomId/invites/:inviteId/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeInvite(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Param('inviteId') inviteId: string,
  ) {
    return this.roomsService.revokeInvite(roomId, inviteId, req.user?.userId ?? '')
  }

  @Get('rooms/:roomId/invites')
  @UseGuards(JwtAuthGuard)
  async listInvites(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
  ) {
    const parsed = limit ? Number(limit) : 3
    return this.roomsService.listInvites(
      roomId,
      req.user?.userId ?? '',
      Number.isFinite(parsed) ? parsed : 3,
    )
  }

  @Post('documents/:documentId/disable-collab')
  @UseGuards(JwtAuthGuard)
  async disableCollab(@Req() req: AuthRequest, @Param('documentId') documentId: string) {
    return this.roomsService.disableCollab(documentId, req.user?.userId ?? '')
  }
}
