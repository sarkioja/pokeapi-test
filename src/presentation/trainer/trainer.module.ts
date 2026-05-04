import { Module } from '@nestjs/common';
import { TrainerController } from './trainer.controller';
import { TrainerApplicationModule } from '../../infrastructure/modules/trainer-application.module';

@Module({
  imports: [TrainerApplicationModule],
  controllers: [TrainerController],
})
export class TrainerModule {}
