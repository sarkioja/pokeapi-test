import { Trainer } from '../../../domain/trainer/trainer.entity';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';

export class RestoreTrainerUseCase {
  constructor(private readonly trainerRepository: TrainerRepositoryPort) {}

  async execute(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findWithDeletedById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);

    const emailTaken = await this.trainerRepository.existsActiveByEmail(trainer.email, id);
    if (emailTaken) throw new EmailConflictException(trainer.email);

    return this.trainerRepository.restoreWithTeams(id);
  }
}
