import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRAINER_REPOSITORY } from '../../di/tokens';
import { TrainerOrmEntity } from './entities/trainer.orm-entity';
import { TrainerTypeOrmRepository } from './repositories/trainer.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([TrainerOrmEntity])],
  providers: [{ provide: TRAINER_REPOSITORY, useClass: TrainerTypeOrmRepository }],
  exports: [TRAINER_REPOSITORY],
})
export class TrainerPersistenceModule {}
