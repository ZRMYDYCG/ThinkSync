import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  title: string

  @IsOptional()
  @IsString()
  parentDocumentId?: string
}
