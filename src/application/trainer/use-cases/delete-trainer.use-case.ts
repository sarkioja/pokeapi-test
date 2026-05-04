import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class DeleteTrainerUseCase {
  constructor(private readonly trainerRepository: TrainerRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);

    await this.trainerRepository.softDeleteWithTeams(id, new Date());
  }
}
