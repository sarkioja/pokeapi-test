import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class RemovePokemonFromTeamUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(teamId: string, pokemonId: string): Promise<void> {
    const team = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!team) throw new ResourceNotFoundException('Team', teamId);

    if (!team.hasSlot(pokemonId)) {
      throw new ResourceNotFoundException('Pokemon slot in team', pokemonId);
    }

    await this.teamRepository.removePokemon(teamId, pokemonId);
  }
}
