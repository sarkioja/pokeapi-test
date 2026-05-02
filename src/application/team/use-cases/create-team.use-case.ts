import { Inject } from '@nestjs/common';
import { Team } from '../../../domain/team/team.entity';
import { TEAM_REPOSITORY, TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { TRAINER_REPOSITORY, TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class CreateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepositoryPort,
    @Inject(TRAINER_REPOSITORY)
    private readonly trainerRepository: TrainerRepositoryPort,
  ) {}

  async execute(name: string, trainerId: string): Promise<Team> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) throw new ResourceNotFoundException('Trainer', trainerId);
    return this.teamRepository.create({ name, trainerId });
  }
}
