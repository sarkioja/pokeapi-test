import { Inject } from '@nestjs/common';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { TRAINER_REPOSITORY, TrainerRepositoryPort, TrainerPage } from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class GetTrainerUseCase {
  constructor(
    @Inject(TRAINER_REPOSITORY)
    private readonly trainerRepository: TrainerRepositoryPort,
  ) {}

  async findById(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);
    return trainer;
  }

  async findAll(limit: number, offset: number): Promise<TrainerPage> {
    return this.trainerRepository.findAll(limit, offset);
  }
}
