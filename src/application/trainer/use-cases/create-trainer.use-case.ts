import { Trainer } from '../../../domain/trainer/trainer.entity';
import {
  TrainerRepositoryPort,
  CreateTrainerData,
} from '../../../domain/trainer/trainer.repository.port';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';

export class CreateTrainerUseCase {
  constructor(private readonly trainerRepository: TrainerRepositoryPort) {}

  async execute(data: CreateTrainerData): Promise<Trainer> {
    const emailTaken = await this.trainerRepository.existsActiveByEmail(data.email);
    if (emailTaken) {
      throw new EmailConflictException(data.email);
    }
    return this.trainerRepository.create(data);
  }
}
