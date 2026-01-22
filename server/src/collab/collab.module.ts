import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { CollabGateway } from './collab.gateway'
import { CollabService } from './collab.service'

@Module({
  imports: [AuthModule],
  providers: [CollabService, CollabGateway],
  exports: [CollabService],
})
export class CollabModule {}
