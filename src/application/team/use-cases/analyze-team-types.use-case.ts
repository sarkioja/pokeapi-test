import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TEAM_REPOSITORY, TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { POKEMON_REPOSITORY, PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { POKEAPI_PORT, PokeApiPort } from '../../../domain/ports/pokeapi.port';
import { DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export interface TypeAnalysis {
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
}

export class AnalyzeTeamTypesUseCase {
  private readonly logger = new Logger(AnalyzeTeamTypesUseCase.name);
  private readonly typeTtlMs: number;

  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepositoryPort,
    @Inject(POKEMON_REPOSITORY)
    private readonly pokemonRepository: PokemonRepositoryPort,
    @Inject(POKEAPI_PORT)
    private readonly pokeApi: PokeApiPort,
    private readonly config: ConfigService,
  ) {
    const ttlDays = Number(this.config.get<number>('POKEMON_TYPE_TTL_DAYS', 7));
    this.typeTtlMs = ttlDays * 24 * 60 * 60 * 1000;
  }

  async execute(teamId: string): Promise<TypeAnalysis> {
    const team = await this.teamRepository.findByIdWithPokemon(teamId);
    if (!team) throw new ResourceNotFoundException('Team', teamId);

    const allTypes = new Set<string>();
    for (const tp of team.pokemon) {
      if (tp.pokemon) {
        tp.pokemon.types.forEach((t) => allTypes.add(t));
      }
    }

    const damageRelationsMap = new Map<string, DamageRelations>();
    for (const typeName of allTypes) {
      const relations = await this.getOrFetchTypeRelations(typeName);
      if (relations) damageRelationsMap.set(typeName, relations);
    }

    return this.computeAnalysis(damageRelationsMap);
  }

  private async getOrFetchTypeRelations(typeName: string): Promise<DamageRelations | null> {
    const cached = await this.pokemonRepository.findTypeByName(typeName);
    const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < this.typeTtlMs;

    if (isFresh) return cached.damageRelations;

    try {
      const relations = await this.pokeApi.fetchTypeEffectiveness(typeName);
      const fetchedAt = new Date();
      await this.pokemonRepository.upsertType(typeName, relations, fetchedAt);
      return relations;
    } catch (err) {
      if (cached) {
        this.logger.warn(`PokéAPI unavailable for type "${typeName}"; using stale cache`);
        return cached.damageRelations;
      }
      this.logger.error(`Failed to fetch type effectiveness for "${typeName}"`, err);
      return null;
    }
  }

  private computeAnalysis(relationsMap: Map<string, DamageRelations>): TypeAnalysis {
    // Accumulate damage multipliers from each attacking type
    const multipliers = new Map<string, number>();

    const applyRelations = (dr: DamageRelations) => {
      for (const t of dr.doubleDamageFrom) {
        multipliers.set(t, (multipliers.get(t) ?? 1) * 2);
      }
      for (const t of dr.halfDamageFrom) {
        multipliers.set(t, (multipliers.get(t) ?? 1) * 0.5);
      }
      for (const t of dr.noDamageFrom) {
        multipliers.set(t, 0);
      }
    };

    for (const dr of relationsMap.values()) {
      applyRelations(dr);
    }

    const weaknesses: string[] = [];
    const resistances: string[] = [];
    const immunities: string[] = [];

    for (const [type, mult] of multipliers.entries()) {
      if (mult === 0) immunities.push(type);
      else if (mult > 1) weaknesses.push(type);
      else if (mult < 1) resistances.push(type);
    }

    return {
      weaknesses: weaknesses.sort(),
      resistances: resistances.sort(),
      immunities: immunities.sort(),
    };
  }
}
