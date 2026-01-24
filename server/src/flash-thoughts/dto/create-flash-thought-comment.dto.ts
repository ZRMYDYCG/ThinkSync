import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateFlashThoughtCommentDto {
  @IsString()
  @MinLength(1)
  content: string

  @IsOptional()
  @IsString()
  parentId?: string
}
