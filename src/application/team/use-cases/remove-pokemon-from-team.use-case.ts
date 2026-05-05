import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';

export class RemovePokemonFromTeamUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(teamId: string, slotId: string): Promise<void> {
    const team = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!team) throw new ResourceNotFoundException('Team', teamId);

    if (!team.hasSlot(slotId)) {
      throw new ResourceNotFoundException('Pokemon slot in team', slotId);
    }

    await this.teamRepository.removePokemon(teamId, slotId);
  }
}
