import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AiModule } from './ai/ai.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
// Register AI Module
import { AuthModule } from './auth/auth.module'
import { DocumentsModule } from './documents/documents.module'
import { FlashThoughtsModule } from './flash-thoughts/flash-thoughts.module'
import { PrismaModule } from './prisma/prisma.module'
import { UploadsModule } from './uploads/uploads.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiModule,
    AuthModule,
    DocumentsModule,
    FlashThoughtsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
