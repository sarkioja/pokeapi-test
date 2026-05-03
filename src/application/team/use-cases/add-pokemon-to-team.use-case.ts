import { Inject } from '@nestjs/common';
import { Team } from '../../../domain/team/team.entity';
import { TEAM_REPOSITORY, TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { TeamFullException } from '../../../domain/exceptions/team-full.exception';
import { DuplicatePokemonException } from '../../../domain/exceptions/duplicate-pokemon.exception';
import { TeamArchivedException } from '../../../domain/exceptions/team-archived.exception';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { GetOrFetchPokemonUseCase } from '../../pokemon/use-cases/get-or-fetch-pokemon.use-case';

export class AddPokemonToTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepositoryPort,
    private readonly getOrFetchPokemon: GetOrFetchPokemonUseCase,
  ) {}

  async execute(teamId: string, pokemonName: string, nickname?: string): Promise<Team> {
    const team = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!team) throw new ResourceNotFoundException('Team', teamId);
    if (team.isArchived()) throw new TeamArchivedException();
    if (team.isFull()) throw new TeamFullException();

    const pokemon = await this.getOrFetchPokemon.executeByName(pokemonName);

    if (team.hasPokemon(pokemon.id)) throw new DuplicatePokemonException();

    const usedSlots = new Set(team.pokemon.map((tp) => tp.slot));
    let nextSlot = 1;
    while (usedSlots.has(nextSlot)) nextSlot++;

    await this.teamRepository.addPokemon(teamId, pokemon.id, nextSlot, nickname);

    const updated = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!updated) throw new ResourceNotFoundException('Team', teamId);
    return updated;
  }
}
