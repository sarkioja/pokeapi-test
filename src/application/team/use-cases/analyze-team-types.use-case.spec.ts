import { AnalyzeTeamTypesUseCase } from './analyze-team-types.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { Team } from '../../../domain/team/team.entity';
import { TeamPokemon } from '../../../domain/team-pokemon/team-pokemon.entity';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import { TypeFetcher } from '../../pokemon/use-cases/get-or-fetch-type.use-case';

const ELECTRIC_RELATIONS: DamageRelations = {
  doubleDamageTo: ['water', 'flying'],
  halfDamageTo: ['electric', 'grass', 'dragon'],
  noDamageTo: ['ground'],
  doubleDamageFrom: ['ground'],
  halfDamageFrom: ['electric', 'flying', 'steel'],
  noDamageFrom: [],
};

const makePokemon = (types: string[]): Pokemon =>
  new Pokemon('p-1', 25, 'pikachu', null, types, 112, 4, 60, new Date(), new Date(), new Date());

const makeSlot = (types: string[]): TeamPokemon => {
  const slot = new TeamPokemon('slot-1', 'team-1', 'p-1', 1, null, new Date());
  slot.pokemon = makePokemon(types);
  return slot;
};

const makeTeam = (slots: TeamPokemon[]): Team =>
  new Team('team-1', 'Dream Team', 'active', 'trainer-1', slots, new Date(), new Date());

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

const makeGetOrFetchType = (): jest.Mocked<TypeFetcher> => ({
  execute: jest.fn(),
});

describe('AnalyzeTeamTypesUseCase', () => {
  let useCase: AnalyzeTeamTypesUseCase;
  let teamRepo: jest.Mocked<TeamRepositoryPort>;
  let getOrFetchType: jest.Mocked<TypeFetcher>;

  beforeEach(() => {
    teamRepo = makeTeamRepo();
    getOrFetchType = makeGetOrFetchType();
    useCase = new AnalyzeTeamTypesUseCase(teamRepo, getOrFetchType);
  });

  it('throws ResourceNotFoundException when team does not exist', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(null);

    await expect(useCase.execute('team-1')).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it('returns correct weaknesses, resistances, and immunities for electric type', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot(['electric'])]));
    getOrFetchType.execute.mockResolvedValue(ELECTRIC_RELATIONS);

    const result = await useCase.execute('team-1');

    expect(getOrFetchType.execute).toHaveBeenCalledWith('electric');
    expect(result.weaknesses).toContain('ground');
    expect(result.resistances).toContain('electric');
    expect(result.resistances).toContain('flying');
    expect(result.resistances).toContain('steel');
    expect(result.immunities).toHaveLength(0);
  });

  it('skips types for which getOrFetchType returns null', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot(['fire'])]));
    getOrFetchType.execute.mockResolvedValue(null);

    const result = await useCase.execute('team-1');

    expect(result.weaknesses).toHaveLength(0);
    expect(result.resistances).toHaveLength(0);
    expect(result.immunities).toHaveLength(0);
  });
});
