import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import { TypeFetcher } from '../../pokemon/use-cases/get-or-fetch-type.use-case';

export interface TypeAnalysis {
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
}

export class AnalyzeTeamTypesUseCase {
  constructor(
    private readonly teamRepository: TeamRepositoryPort,
    private readonly getOrFetchType: TypeFetcher,
  ) {}

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
      const relations = await this.getOrFetchType.execute(typeName);
      if (relations) damageRelationsMap.set(typeName, relations);
    }

    return this.computeAnalysis(damageRelationsMap);
  }

  private computeAnalysis(relationsMap: Map<string, DamageRelations>): TypeAnalysis {
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
