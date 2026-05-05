import { GetOrFetchTypeUseCase } from './get-or-fetch-type.use-case';
import { PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { PokeApiPort } from '../../../domain/ports/pokeapi.port';
import { PokemonType, DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';

const FIRE_RELATIONS: DamageRelations = {
  doubleDamageTo: ['grass', 'ice', 'bug', 'steel'],
  halfDamageTo: ['fire', 'water', 'rock', 'dragon'],
  noDamageTo: [],
  doubleDamageFrom: ['water', 'ground', 'rock'],
  halfDamageFrom: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
  noDamageFrom: [],
};

const makeType = (dr: DamageRelations, fetchedAt = new Date()): PokemonType =>
  new PokemonType('type-1', 'fire', dr, fetchedAt);

const makePokemonRepo = (): jest.Mocked<PokemonRepositoryPort> => ({
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

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const makeLogger = () => ({ warn: jest.fn(), error: jest.fn() });

describe('GetOrFetchTypeUseCase', () => {
  let useCase: GetOrFetchTypeUseCase;
  let pokemonRepo: jest.Mocked<PokemonRepositoryPort>;
  let pokeApi: jest.Mocked<PokeApiPort>;

  beforeEach(() => {
    pokemonRepo = makePokemonRepo();
    pokeApi = makePokeApi();
    useCase = new GetOrFetchTypeUseCase(pokemonRepo, pokeApi, TTL_MS, makeLogger());
  });

  it('returns cached relations when fresh', async () => {
    pokemonRepo.findTypeByName.mockResolvedValue(makeType(FIRE_RELATIONS));

    const result = await useCase.execute('fire');

    expect(result).toEqual(FIRE_RELATIONS);
    expect(pokeApi.fetchTypeEffectiveness).not.toHaveBeenCalled();
  });

  it('fetches from PokéAPI when cache is missing', async () => {
    pokemonRepo.findTypeByName.mockResolvedValue(null);
    pokeApi.fetchTypeEffectiveness.mockResolvedValue(FIRE_RELATIONS);
    pokemonRepo.upsertType.mockResolvedValue(makeType(FIRE_RELATIONS));

    const result = await useCase.execute('fire');

    expect(pokeApi.fetchTypeEffectiveness).toHaveBeenCalledWith('fire');
    expect(pokemonRepo.upsertType).toHaveBeenCalled();
    expect(result).toEqual(FIRE_RELATIONS);
  });

  it('fetches from PokéAPI when cache is stale', async () => {
    const stale = makeType(FIRE_RELATIONS, new Date(Date.now() - 8 * 24 * 60 * 60 * 1000));
    pokemonRepo.findTypeByName.mockResolvedValue(stale);
    pokeApi.fetchTypeEffectiveness.mockResolvedValue(FIRE_RELATIONS);
    pokemonRepo.upsertType.mockResolvedValue(makeType(FIRE_RELATIONS));

    const result = await useCase.execute('fire');

    expect(pokeApi.fetchTypeEffectiveness).toHaveBeenCalledWith('fire');
    expect(result).toEqual(FIRE_RELATIONS);
  });

  it('returns stale cache when PokéAPI is unavailable', async () => {
    const stale = makeType(FIRE_RELATIONS, new Date(Date.now() - 8 * 24 * 60 * 60 * 1000));
    pokemonRepo.findTypeByName.mockResolvedValue(stale);
    pokeApi.fetchTypeEffectiveness.mockRejectedValue(new Error('network error'));

    const result = await useCase.execute('fire');

    expect(result).toEqual(FIRE_RELATIONS);
  });

  it('returns null when PokéAPI is unavailable and no cache exists', async () => {
    pokemonRepo.findTypeByName.mockResolvedValue(null);
    pokeApi.fetchTypeEffectiveness.mockRejectedValue(new Error('network error'));

    const result = await useCase.execute('fire');

    expect(result).toBeNull();
  });
});
