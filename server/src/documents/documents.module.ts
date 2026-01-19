import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";

@Module({
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
