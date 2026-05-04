import { Team } from '../../../domain/team/team.entity';
import { TeamRepositoryPort, TeamPage } from '../../../domain/team/team.repository.port';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';

export class GetTeamUseCase {
  constructor(
    private readonly teamRepository: TeamRepositoryPort,
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
