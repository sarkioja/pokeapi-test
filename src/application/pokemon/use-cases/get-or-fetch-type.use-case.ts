import { PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { PokeApiPort } from '../../../domain/ports/pokeapi.port';
import { DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';
import { LoggerPort } from '../../ports/logger.port';
import { TypeFetcher } from '../../ports/type-fetcher.port';

export class GetOrFetchTypeUseCase implements TypeFetcher {
  constructor(
    private readonly pokemonRepository: PokemonRepositoryPort,
    private readonly pokeApi: PokeApiPort,
    private readonly ttlMs: number,
    private readonly logger: LoggerPort,
  ) {}

  async execute(typeName: string): Promise<DamageRelations | null> {
    const cached = await this.pokemonRepository.findTypeByName(typeName);
    const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < this.ttlMs;
    if (isFresh) return cached.damageRelations;

    try {
      const relations = await this.pokeApi.fetchTypeEffectiveness(typeName);
      await this.pokemonRepository.upsertType(typeName, relations, new Date());
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
}
