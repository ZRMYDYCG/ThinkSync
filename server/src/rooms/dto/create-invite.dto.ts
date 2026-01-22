import { RoomRole } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, Min } from 'class-validator'

export class CreateInviteDto {
  @IsEnum(RoomRole)
  role!: RoomRole

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  expiresAt?: Date

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  maxUses?: number
}
