import { RoomRole } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateMemberRoleDto {
  @IsEnum(RoomRole)
  role!: RoomRole
}
