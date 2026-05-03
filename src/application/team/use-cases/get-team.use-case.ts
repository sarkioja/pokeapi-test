import { Inject } from '@nestjs/common';
import { Team } from '../../../domain/team/team.entity';
import {
  TEAM_REPOSITORY,
  TeamRepositoryPort,
  TeamPage,
} from '../../../domain/team/team.repository.port';
import {
  TRAINER_REPOSITORY,
  TrainerRepositoryPort,
} from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class GetTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepositoryPort,
    @Inject(TRAINER_REPOSITORY)
    private readonly trainerRepository: TrainerRepositoryPort,
  ) {}

  async findById(id: string): Promise<Team> {
    const team = await this.teamRepository.findByIdWithPokemon(id);
    if (!team) throw new ResourceNotFoundException('Team', id);
    return team;
  }

  async findByTrainerId(trainerId: string, limit: number, offset: number): Promise<TeamPage> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) throw new ResourceNotFoundException('Trainer', trainerId);
    return this.teamRepository.findByTrainerId(trainerId, limit, offset);
  }
}
