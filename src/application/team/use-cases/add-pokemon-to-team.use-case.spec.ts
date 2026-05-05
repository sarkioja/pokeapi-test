import { AddPokemonToTeamUseCase } from './add-pokemon-to-team.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { GetOrFetchPokemonUseCase } from '../../pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { Team } from '../../../domain/team/team.entity';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { TeamPokemon } from '../../../domain/team-pokemon/team-pokemon.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import { TeamArchivedException } from '../../../domain/exceptions/team-archived.exception';
import { TeamFullException } from '../../../domain/exceptions/team-full.exception';
import { DuplicatePokemonException } from '../../../domain/exceptions/duplicate-pokemon.exception';

const makePokemon = (id = 'p-1'): Pokemon =>
  new Pokemon(
    id,
    25,
    'pikachu',
    null,
    ['electric'],
    112,
    4,
    60,
    new Date(),
    new Date(),
    new Date(),
  );

const makeSlot = (pokemonId: string, slot: number): TeamPokemon =>
  new TeamPokemon(`slot-${slot}`, 'team-1', pokemonId, slot, null, new Date());

const makeTeam = (
  overrides: Partial<{ status: 'active' | 'archived'; pokemon: TeamPokemon[] }> = {},
): Team =>
  new Team(
    'team-1',
    'Dream Team',
    overrides.status ?? 'active',
    'trainer-1',
    overrides.pokemon ?? [],
    new Date(),
    new Date(),
  );

const makeRepo = (): jest.Mocked<TeamRepositoryPort> => ({
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

describe('AddPokemonToTeamUseCase', () => {
  let useCase: AddPokemonToTeamUseCase;
  let teamRepo: jest.Mocked<TeamRepositoryPort>;
  let getOrFetch: jest.Mocked<Pick<GetOrFetchPokemonUseCase, 'executeByName'>>;

  beforeEach(() => {
    teamRepo = makeRepo();
    getOrFetch = { executeByName: jest.fn() };
    useCase = new AddPokemonToTeamUseCase(teamRepo, getOrFetch as any);
  });

  it('throws ResourceNotFoundException when team does not exist', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(null);

    await expect(useCase.execute('team-1', 'pikachu')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(getOrFetch.executeByName).not.toHaveBeenCalled();
  });

  it('throws TeamArchivedException when team is archived', async () => {
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam({ status: 'archived' }));

    await expect(useCase.execute('team-1', 'pikachu')).rejects.toBeInstanceOf(
      TeamArchivedException,
    );
    expect(getOrFetch.executeByName).not.toHaveBeenCalled();
  });

  it('throws TeamFullException when team already has 5 pokemon', async () => {
    const slots = [1, 2, 3, 4, 5].map((i) => makeSlot(`p-${i}`, i));
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam({ pokemon: slots }));

    await expect(useCase.execute('team-1', 'pikachu')).rejects.toBeInstanceOf(TeamFullException);
    expect(getOrFetch.executeByName).not.toHaveBeenCalled();
  });

  it('throws DuplicatePokemonException when pokemon is already in team', async () => {
    const existing = makeSlot('p-1', 1);
    teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam({ pokemon: [existing] }));
    getOrFetch.executeByName.mockResolvedValue(makePokemon('p-1'));

    await expect(useCase.execute('team-1', 'pikachu')).rejects.toBeInstanceOf(
      DuplicatePokemonException,
    );
    expect(teamRepo.addPokemon).not.toHaveBeenCalled();
  });

  it('adds pokemon to the next available slot and returns updated team', async () => {
    const existingSlots = [makeSlot('p-2', 1), makeSlot('p-3', 3)]; // slots 1 and 3 taken
    const emptyTeam = makeTeam({ pokemon: existingSlots });
    const updatedTeam = makeTeam({ pokemon: [...existingSlots, makeSlot('p-1', 2)] });

    teamRepo.findByIdWithPokemon
      .mockResolvedValueOnce(emptyTeam)
      .mockResolvedValueOnce(updatedTeam);
    getOrFetch.executeByName.mockResolvedValue(makePokemon('p-1'));
    teamRepo.addPokemon.mockResolvedValue(undefined);

    const result = await useCase.execute('team-1', 'pikachu', 'Pika');

    expect(teamRepo.addPokemon).toHaveBeenCalledWith('team-1', 'p-1', 2, 'Pika');
    expect(result.pokemon).toHaveLength(3);
  });
});
