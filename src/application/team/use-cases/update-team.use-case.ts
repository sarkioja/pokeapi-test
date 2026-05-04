import { Team } from '../../../domain/team/team.entity';
import { TeamRepositoryPort, UpdateTeamData } from '../../../domain/team/team.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';

export class UpdateTeamUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(id: string, data: UpdateTeamData): Promise<Team> {
    const team = await this.teamRepository.findById(id);
    if (!team) throw new ResourceNotFoundException('Team', id);
    return this.teamRepository.update(id, data);
  }
}
