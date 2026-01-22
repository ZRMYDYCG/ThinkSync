import { Module } from '@nestjs/common'

import { RoomsController } from './rooms.controller'
import { RoomsService } from './rooms.service'

@Module({
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
