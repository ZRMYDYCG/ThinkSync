import { Module } from '@nestjs/common'

import { FlashThoughtsController } from './flash-thoughts.controller'
import { FlashThoughtsService } from './flash-thoughts.service'

@Module({
  providers: [FlashThoughtsService],
  controllers: [FlashThoughtsController],
})
export class FlashThoughtsModule {}
