import { GetOrFetchPokemonUseCase } from './get-or-fetch-pokemon.use-case';
import { PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { PokeApiPort } from '../../../domain/ports/pokeapi.port';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { ExternalServiceException } from '../../../domain/exceptions/external-service.exception';

const makePokemon = (fetchedAt: Date = new Date()): Pokemon =>
  new Pokemon(
    'p-1',
    25,
    'pikachu',
    null,
    ['electric'],
    112,
    4,
    60,
    fetchedAt,
    new Date(),
    new Date(),
  );

const POKEAPI_DATA = {
  pokeapiId: 25,
  name: 'pikachu',
  spriteUrl: null,
  types: ['electric'],
  baseExperience: 112,
  height: 4,
  weight: 60,
};

const makeRepo = (): jest.Mocked<PokemonRepositoryPort> => ({
  upsertByPokeapiId: jest.fn(),
  findById: jest.fn(),
  findByPokeapiId: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  upsertType: jest.fn(),
  findTypeByName: jest.fn(),
});

const makePokeApi = (): jest.Mocked<PokeApiPort> => ({
  fetchPokemonByName: jest.fn(),
  fetchPokemonById: jest.fn(),
  fetchTypeEffectiveness: jest.fn(),
});

const makeConfig = (ttlHours = 24) => ({ get: jest.fn().mockReturnValue(ttlHours) });

describe('GetOrFetchPokemonUseCase', () => {
  let useCase: GetOrFetchPokemonUseCase;
  let repo: jest.Mocked<PokemonRepositoryPort>;
  let pokeApi: jest.Mocked<PokeApiPort>;

  beforeEach(() => {
    repo = makeRepo();
    pokeApi = makePokeApi();
    useCase = new GetOrFetchPokemonUseCase(repo, pokeApi, makeConfig() as any);
  });

  describe('executeByName', () => {
    it('returns cached pokemon when TTL is still fresh', async () => {
      const fresh = makePokemon(new Date()); // just now
      repo.findByName.mockResolvedValue(fresh);

      const result = await useCase.executeByName('pikachu');

      expect(pokeApi.fetchPokemonByName).not.toHaveBeenCalled();
      expect(result).toBe(fresh);
    });

    it('fetches from PokéAPI when pokemon is not cached', async () => {
      repo.findByName.mockResolvedValue(null);
      pokeApi.fetchPokemonByName.mockResolvedValue(POKEAPI_DATA);
      const fresh = makePokemon();
      repo.upsertByPokeapiId.mockResolvedValue(fresh);

      const result = await useCase.executeByName('pikachu');

      expect(pokeApi.fetchPokemonByName).toHaveBeenCalledWith('pikachu');
      expect(repo.upsertByPokeapiId).toHaveBeenCalled();
      expect(result).toBe(fresh);
    });

    it('re-fetches from PokéAPI when cached pokemon is stale', async () => {
      const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25h ago
      const stale = makePokemon(staleDate);
      repo.findByName.mockResolvedValue(stale);
      pokeApi.fetchPokemonByName.mockResolvedValue(POKEAPI_DATA);
      const fresh = makePokemon();
      repo.upsertByPokeapiId.mockResolvedValue(fresh);

      await useCase.executeByName('pikachu');

      expect(pokeApi.fetchPokemonByName).toHaveBeenCalledWith('pikachu');
    });

    it('returns stale data when PokéAPI is unavailable and cache exists', async () => {
      const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const stale = makePokemon(staleDate);
      repo.findByName.mockResolvedValue(stale);
      pokeApi.fetchPokemonByName.mockRejectedValue(new Error('network error'));

      const result = await useCase.executeByName('pikachu');

      expect(result).toBe(stale);
    });

    it('throws ExternalServiceException when PokéAPI fails and no cache exists', async () => {
      repo.findByName.mockResolvedValue(null);
      pokeApi.fetchPokemonByName.mockRejectedValue(new Error('network error'));

      await expect(useCase.executeByName('pikachu')).rejects.toBeInstanceOf(
        ExternalServiceException,
      );
    });
  });

  describe('executeById', () => {
    it('returns cached pokemon when TTL is fresh', async () => {
      const fresh = makePokemon(new Date());
      repo.findByPokeapiId.mockResolvedValue(fresh);

      const result = await useCase.executeById(25);

      expect(pokeApi.fetchPokemonById).not.toHaveBeenCalled();
      expect(result).toBe(fresh);
    });

    it('fetches from PokéAPI when not cached', async () => {
      repo.findByPokeapiId.mockResolvedValue(null);
      pokeApi.fetchPokemonById.mockResolvedValue(POKEAPI_DATA);
      const fresh = makePokemon();
      repo.upsertByPokeapiId.mockResolvedValue(fresh);

      await useCase.executeById(25);

      expect(pokeApi.fetchPokemonById).toHaveBeenCalledWith(25);
    });
  });
});
