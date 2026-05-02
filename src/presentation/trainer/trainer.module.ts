import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerController } from './trainer.controller';
import { TrainerOrmEntity } from '../../infrastructure/database/typeorm/entities/trainer.orm-entity';
import { TrainerTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/trainer.typeorm-repository';
import { ViaCepModule } from '../../infrastructure/http-clients/viacep/viacep.module';
import { TRAINER_REPOSITORY } from '../../domain/trainer/trainer.repository.port';
import { CreateTrainerUseCase } from '../../application/trainer/use-cases/create-trainer.use-case';
import { GetTrainerUseCase } from '../../application/trainer/use-cases/get-trainer.use-case';
import { UpdateTrainerUseCase } from '../../application/trainer/use-cases/update-trainer.use-case';
import { EnrichTrainerCepUseCase } from '../../application/trainer/use-cases/enrich-trainer-cep.use-case';
import { DeleteTrainerUseCase } from '../../application/trainer/use-cases/delete-trainer.use-case';
import { RestoreTrainerUseCase } from '../../application/trainer/use-cases/restore-trainer.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TrainerOrmEntity]), ViaCepModule],
  controllers: [TrainerController],
  providers: [
    { provide: TRAINER_REPOSITORY, useClass: TrainerTypeOrmRepository },
    CreateTrainerUseCase,
    GetTrainerUseCase,
    UpdateTrainerUseCase,
    EnrichTrainerCepUseCase,
    DeleteTrainerUseCase,
    RestoreTrainerUseCase,
  ],
  exports: [
    TRAINER_REPOSITORY,
    CreateTrainerUseCase,
    GetTrainerUseCase,
    UpdateTrainerUseCase,
    EnrichTrainerCepUseCase,
    DeleteTrainerUseCase,
    RestoreTrainerUseCase,
  ],
})
export class TrainerModule {}
