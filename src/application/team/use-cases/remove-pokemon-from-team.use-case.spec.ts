import { RemovePokemonFromTeamUseCase } from './remove-pokemon-from-team.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { Team } from '../../../domain/team/team.entity';
import { TeamPokemon } from '../../../domain/team-pokemon/team-pokemon.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makeSlot = (id = 'slot-1'): TeamPokemon =>
  new TeamPokemon(id, 'team-1', 'p-1', 1, null, new Date());

const makeTeam = (pokemon: TeamPokemon[] = []): Team =>
  new Team('team-1', 'Dream Team', 'active', 'trainer-1', pokemon, new Date(), new Date());

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

describe('RemovePokemonFromTeamUseCase', () => {
  let useCase: RemovePokemonFromTeamUseCase;
  let repo: jest.Mocked<TeamRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new RemovePokemonFromTeamUseCase(repo);
  });

  it('throws ResourceNotFoundException when team does not exist', async () => {
    repo.findByIdWithPokemon.mockResolvedValue(null);

    await expect(useCase.execute('team-1', 'slot-1')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(repo.removePokemon).not.toHaveBeenCalled();
  });

  it('throws ResourceNotFoundException when slot is not in team', async () => {
    repo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot('slot-other')]));

    await expect(useCase.execute('team-1', 'slot-1')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(repo.removePokemon).not.toHaveBeenCalled();
  });

  it('removes pokemon slot from team', async () => {
    repo.findByIdWithPokemon.mockResolvedValue(makeTeam([makeSlot('slot-1')]));
    repo.removePokemon.mockResolvedValue(undefined);

    await useCase.execute('team-1', 'slot-1');

    expect(repo.removePokemon).toHaveBeenCalledWith('team-1', 'slot-1');
  });
});
