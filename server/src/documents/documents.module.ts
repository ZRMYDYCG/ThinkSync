import { Module } from '@nestjs/common'

import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'

@Module({
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
