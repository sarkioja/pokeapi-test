import { UpdateTeamUseCase } from './update-team.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { Team } from '../../../domain/team/team.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makeTeam = (name = 'Dream Team'): Team =>
  new Team('team-1', name, 'active', 'trainer-1', [], new Date(), new Date());

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

describe('UpdateTeamUseCase', () => {
  let useCase: UpdateTeamUseCase;
  let repo: jest.Mocked<TeamRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new UpdateTeamUseCase(repo);
  });

  it('throws ResourceNotFoundException when team does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('team-1', { name: 'New Name' })).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('updates and returns team', async () => {
    repo.findById.mockResolvedValue(makeTeam());
    repo.update.mockResolvedValue(makeTeam('New Name'));

    const result = await useCase.execute('team-1', { name: 'New Name' });

    expect(repo.update).toHaveBeenCalledWith('team-1', { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });
});
