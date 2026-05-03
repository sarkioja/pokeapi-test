import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import {
  TRAINER_REPOSITORY,
  TrainerRepositoryPort,
} from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';

export class RestoreTrainerUseCase {
  constructor(
    @Inject(TRAINER_REPOSITORY)
    private readonly trainerRepository: TrainerRepositoryPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findWithDeletedById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);

    const emailTaken = await this.trainerRepository.existsActiveByEmail(trainer.email, id);
    if (emailTaken) throw new EmailConflictException(trainer.email);

    await this.dataSource.transaction(async (manager) => {
      const [row] = await manager.query<{ deleted_at: Date }[]>(
        `SELECT deleted_at FROM trainers WHERE id = $1`,
        [id],
      );

      // Restore only teams deleted at the same instant as the trainer,
      // meaning they were deleted as a consequence of the trainer deletion.
      // Teams independently deleted before retain their deleted_at.
      await manager.query(
        `UPDATE teams SET deleted_at = NULL WHERE trainer_id = $1 AND deleted_at = $2`,
        [id, row.deleted_at],
      );

      await manager.query(`UPDATE trainers SET deleted_at = NULL WHERE id = $1`, [id]);
    });

    return this.trainerRepository.findById(id) as Promise<Trainer>;
  }
}
