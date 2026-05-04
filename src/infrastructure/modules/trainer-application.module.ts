import { Module } from '@nestjs/common';
import { TRAINER_REPOSITORY, VIACEP_PORT } from '../../application/di/tokens';
import { TrainerRepositoryPort } from '../../domain/trainer/trainer.repository.port';
import { ViaCepPort } from '../../domain/ports/viacep.port';
import { TrainerPersistenceModule } from '../database/typeorm/trainer-persistence.module';
import { ViaCepModule } from '../http-clients/viacep/viacep.module';
import { CreateTrainerUseCase } from '../../application/trainer/use-cases/create-trainer.use-case';
import { DeleteTrainerUseCase } from '../../application/trainer/use-cases/delete-trainer.use-case';
import { EnrichTrainerCepUseCase } from '../../application/trainer/use-cases/enrich-trainer-cep.use-case';
import { GetTrainerUseCase } from '../../application/trainer/use-cases/get-trainer.use-case';
import { RestoreTrainerUseCase } from '../../application/trainer/use-cases/restore-trainer.use-case';
import { UpdateTrainerUseCase } from '../../application/trainer/use-cases/update-trainer.use-case';

@Module({
  imports: [TrainerPersistenceModule, ViaCepModule],
  providers: [
    {
      provide: CreateTrainerUseCase,
      inject: [TRAINER_REPOSITORY],
      useFactory: (trainerRepository: TrainerRepositoryPort) =>
        new CreateTrainerUseCase(trainerRepository),
    },
    {
      provide: GetTrainerUseCase,
      inject: [TRAINER_REPOSITORY],
      useFactory: (trainerRepository: TrainerRepositoryPort) =>
        new GetTrainerUseCase(trainerRepository),
    },
    {
      provide: UpdateTrainerUseCase,
      inject: [TRAINER_REPOSITORY],
      useFactory: (trainerRepository: TrainerRepositoryPort) =>
        new UpdateTrainerUseCase(trainerRepository),
    },
    {
      provide: EnrichTrainerCepUseCase,
      inject: [TRAINER_REPOSITORY, VIACEP_PORT],
      useFactory: (trainerRepository: TrainerRepositoryPort, viaCep: ViaCepPort) =>
        new EnrichTrainerCepUseCase(trainerRepository, viaCep),
    },
    {
      provide: DeleteTrainerUseCase,
      inject: [TRAINER_REPOSITORY],
      useFactory: (trainerRepository: TrainerRepositoryPort) =>
        new DeleteTrainerUseCase(trainerRepository),
    },
    {
      provide: RestoreTrainerUseCase,
      inject: [TRAINER_REPOSITORY],
      useFactory: (trainerRepository: TrainerRepositoryPort) =>
        new RestoreTrainerUseCase(trainerRepository),
    },
  ],
  exports: [
    CreateTrainerUseCase,
    GetTrainerUseCase,
    UpdateTrainerUseCase,
    EnrichTrainerCepUseCase,
    DeleteTrainerUseCase,
    RestoreTrainerUseCase,
  ],
})
export class TrainerApplicationModule {}
