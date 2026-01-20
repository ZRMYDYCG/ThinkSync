import { Module } from '@nestjs/common'

import { AiController } from './ai.controller'

@Module({
  controllers: [AiController],
})
export class AiModule {}
