import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  TRAINER_REPOSITORY,
  TrainerRepositoryPort,
} from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class DeleteTrainerUseCase {
  constructor(
    @Inject(TRAINER_REPOSITORY)
    private readonly trainerRepository: TrainerRepositoryPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: string): Promise<void> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);

    const now = new Date();
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `UPDATE teams SET deleted_at = $1 WHERE trainer_id = $2 AND deleted_at IS NULL`,
        [now, id],
      );
      await manager.query(`UPDATE trainers SET deleted_at = $1 WHERE id = $2`, [now, id]);
    });
  }
}
