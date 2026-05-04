import { Trainer } from '../../../domain/trainer/trainer.entity';
import {
  TrainerRepositoryPort,
  UpdateTrainerData,
} from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';

export class UpdateTrainerUseCase {
  constructor(private readonly trainerRepository: TrainerRepositoryPort) {}

  async execute(id: string, data: UpdateTrainerData): Promise<Trainer> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);

    if (data.email) {
      const emailTaken = await this.trainerRepository.existsActiveByEmail(data.email, id);
      if (emailTaken) throw new EmailConflictException(data.email);
    }

    return this.trainerRepository.update(id, data);
  }
}
