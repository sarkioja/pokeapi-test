import { Team } from '../../../domain/team/team.entity';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { GetOrFetchPokemonUseCase } from '../../pokemon/use-cases/get-or-fetch-pokemon.use-case';

export class AddPokemonToTeamUseCase {
  constructor(
    private readonly teamRepository: TeamRepositoryPort,
    private readonly getOrFetchPokemon: GetOrFetchPokemonUseCase,
  ) {}

  async execute(teamId: string, pokemonName: string, nickname?: string): Promise<Team> {
    const team = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!team) throw new ResourceNotFoundException('Team', teamId);
    team.assertCanReceivePokemon();

    const pokemon = await this.getOrFetchPokemon.executeByName(pokemonName);
    team.assertCanAddPokemon(pokemon.id);
    const nextSlot = team.nextAvailableSlot();

    await this.teamRepository.addPokemon(teamId, pokemon.id, nextSlot, nickname);

    const updated = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!updated) throw new ResourceNotFoundException('Team', teamId);
    return updated;
  }
}
