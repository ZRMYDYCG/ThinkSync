import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string | null
}
