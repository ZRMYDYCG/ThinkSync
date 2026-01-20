import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsString()
  coverImage?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  coverPosition?: number

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean
}
