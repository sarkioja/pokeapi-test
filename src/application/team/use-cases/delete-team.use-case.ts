import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class DeleteTeamUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const team = await this.teamRepository.findById(id);
    if (!team) throw new ResourceNotFoundException('Team', id);
    await this.teamRepository.softDelete(id);
  }
}
