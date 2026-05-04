import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { PokeApiPort } from '../../../domain/ports/pokeapi.port';
import {
  ResourceNotFoundException,
  ExternalServiceException,
} from '../../../domain/exceptions/external-service.exception';
import { PokemonCacheConfigPort } from '../../ports/pokemon-cache-config.port';
import { LoggerPort } from '../../ports/logger.port';

export class GetOrFetchPokemonUseCase {
  private readonly ttlMs: number;

  constructor(
    private readonly pokemonRepository: PokemonRepositoryPort,
    private readonly pokeApi: PokeApiPort,
    config: PokemonCacheConfigPort,
    private readonly logger: LoggerPort,
  ) {
    const ttlHours = config.getPokemonTtlHours();
    this.ttlMs = ttlHours * 60 * 60 * 1000;
  }

  async executeByName(name: string): Promise<Pokemon> {
    const existing = await this.pokemonRepository.findByName(name.toLowerCase());
    return this.resolveWithFallback(existing, () => this.pokeApi.fetchPokemonByName(name));
  }

  async executeById(pokeapiId: number): Promise<Pokemon> {
    const existing = await this.pokemonRepository.findByPokeapiId(pokeapiId);
    return this.resolveWithFallback(existing, () => this.pokeApi.fetchPokemonById(pokeapiId));
  }

  private async resolveWithFallback(
    existing: Pokemon | null,
    fetch: () => ReturnType<PokeApiPort['fetchPokemonByName']>,
  ): Promise<Pokemon> {
    const isFresh = existing && Date.now() - existing.fetchedAt.getTime() < this.ttlMs;

    if (isFresh) {
      return existing;
    }

    try {
      const data = await fetch();
      return this.pokemonRepository.upsertByPokeapiId({
        ...data,
        fetchedAt: new Date(),
      });
    } catch (err) {
      if (existing) {
        this.logger.warn(
          `PokéAPI unavailable; serving stale data for pokémon (fetched ${existing.fetchedAt.toISOString()})`,
        );
        return existing;
      }
      if (err instanceof ResourceNotFoundException) throw err;
      if (err instanceof ExternalServiceException) throw err;
      throw new ExternalServiceException('PokéAPI', (err as Error).message);
    }
  }
}
