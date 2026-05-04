import { DeleteTeamUseCase } from './delete-team.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { Team } from '../../../domain/team/team.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makeTeam = (): Team =>
  new Team('team-1', 'Dream Team', 'active', 'trainer-1', [], new Date(), new Date());

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

describe('DeleteTeamUseCase', () => {
  let useCase: DeleteTeamUseCase;
  let repo: jest.Mocked<TeamRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new DeleteTeamUseCase(repo);
  });

  it('throws ResourceNotFoundException when team does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('team-1')).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(repo.softDelete).not.toHaveBeenCalled();
  });

  it('soft deletes team when found', async () => {
    repo.findById.mockResolvedValue(makeTeam());
    repo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('team-1');

    expect(repo.softDelete).toHaveBeenCalledWith('team-1');
  });
});
