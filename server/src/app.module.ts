import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AiModule } from './ai/ai.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
// Register AI Module
import { AuthModule } from './auth/auth.module'
import { CollabModule } from './collab/collab.module'
import { DocumentsModule } from './documents/documents.module'
import { PrismaModule } from './prisma/prisma.module'
import { RoomsModule } from './rooms/rooms.module'
import { UploadsModule } from './uploads/uploads.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiModule,
    AuthModule,
    DocumentsModule,
    RoomsModule,
    CollabModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
