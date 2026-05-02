import { AnalyzeTeamTypesUseCase } from './analyze-team-types.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { PokeApiPort } from '../../../domain/ports/pokeapi.port';
import { Team } from '../../../domain/team/team.entity';
import { TeamPokemon } from '../../../domain/team-pokemon/team-pokemon.entity';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { PokemonType, DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makePokemon = (types: string[]): Pokemon =>
  new Pokemon('p-1', 25, 'pikachu', null, types, 112, 4, 60, new Date(), new Date(), new Date());

const makeSlot = (types: string[]): TeamPokemon => {
  const slot = new TeamPokemon('slot-1', 'team-1', 'p-1', 1, null, new Date());
  slot.pokemon = makePokemon(types);
  return slot;
};

const makeTeam = (slots: TeamPokemon[]): Team =>
  new Team('team-1', 'Dream Team', 'active', 'trainer-1', slots, new Date(), new Date());

const makeType = (dr: Partial<DamageRelations>): PokemonType =>
  new PokemonType('type-1', 'electric', {
    doubleDamageTo: [],
    halfDamageTo: [],
    noDamageTo: [],
    doubleDamageFrom: [],
    halfDamageFrom: [],
    noDamageFrom: [],
    ...dr,
  }, new Date());

const ELECTRIC_RELATIONS: DamageRelations = {
  doubleDamageTo: ['water', 'flying'],
  halfDamageTo: ['electric', 'grass', 'dragon'],
  noDamageTo: ['ground'],
  doubleDamageFrom: ['ground'],
  halfDamageFrom: ['electric', 'flying', 'steel'],
  noDamageFrom: [],
};

const makeTeamRepo = (): jest.Mocked<TeamRepositoryPort> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithPokemon: jest.fn(),
  findByTrainerId: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  softDeleteByTrainerId: jest.fn(),
  addPokemon: jest.fn(),
  removePokemon: jest.fn(),
});

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

describe('AnalyzeTeamTypesUseCase', () => {
  let useCase: AnalyzeTeamTypesUseCase;
  let teamRepo: jest.Mocked<TeamRepositoryPort>;
  let pokemonRepo: jest.Mocked<PokemonRepositoryPort>;
  let pokeApi: jest.Mocked<PokeApiPort>;

  beforeEach(() => {
    teamRepo = makeTeamRepo();
    pokemonRepo = makePokemonRepo();
    pokeApi = makePokeApi();
    useCase = new AnalyzeTeamTypesUseCase(teamRepo, pokemonRepo, pokeApi, { get: jest.fn().mockReturnValue(7) } as any);
  });

  it('throws ResourceNotFoundException when team does not exist', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(null);

    await expect(useCase.execute('team-1')).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it('returns correct weaknesses, resistances, and immunities for electric type', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot(['electric'])]));
    pokemonRepo.findTypeByName.mockResolvedValue(makeType(ELECTRIC_RELATIONS));

    const result = await useCase.execute('team-1');

    expect(result.weaknesses).toContain('ground');
    expect(result.resistances).toContain('electric');
    expect(result.resistances).toContain('flying');
    expect(result.resistances).toContain('steel');
    expect(result.immunities).toHaveLength(0);
  });

  it('fetches type from PokéAPI when not in local cache', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot(['electric'])]));
    pokemonRepo.findTypeByName.mockResolvedValue(null);
    pokeApi.fetchTypeEffectiveness.mockResolvedValue(ELECTRIC_RELATIONS);
    pokemonRepo.upsertType.mockResolvedValue(makeType(ELECTRIC_RELATIONS));

    await useCase.execute('team-1');

    expect(pokeApi.fetchTypeEffectiveness).toHaveBeenCalledWith('electric');
    expect(pokemonRepo.upsertType).toHaveBeenCalled();
  });

  it('uses stale cache when PokéAPI is unavailable', async () => {
    const stale = makeType(ELECTRIC_RELATIONS);
    stale.fetchedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days old
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot(['electric'])]));
    pokemonRepo.findTypeByName.mockResolvedValue(stale);
    pokeApi.fetchTypeEffectiveness.mockRejectedValue(new Error('network error'));

    const result = await useCase.execute('team-1');

    expect(result.weaknesses).toContain('ground');
  });
});
