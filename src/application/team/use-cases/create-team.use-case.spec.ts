import { CreateTeamUseCase } from './create-team.use-case';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { Team } from '../../../domain/team/team.entity';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makeTrainer = (): Trainer =>
  new Trainer(
    'trainer-1',
    'Ash Ketchum',
    'ash@pokemon.com',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    new Date(),
    new Date(),
  );

const makeTeam = (): Team =>
  new Team('team-1', 'Dream Team', 'active', 'trainer-1', [], new Date(), new Date());

const makeTrainerRepo = (): jest.Mocked<TrainerRepositoryPort> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findWithDeletedById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  updateAddress: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  restoreWithTeams: jest.fn(),
  existsActiveByEmail: jest.fn(),
});

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

describe('CreateTeamUseCase', () => {
  let useCase: CreateTeamUseCase;
  let trainerRepo: jest.Mocked<TrainerRepositoryPort>;
  let teamRepo: jest.Mocked<TeamRepositoryPort>;

  beforeEach(() => {
    trainerRepo = makeTrainerRepo();
    teamRepo = makeTeamRepo();
    useCase = new CreateTeamUseCase(teamRepo, trainerRepo);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    trainerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('Dream Team', 'trainer-1')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(teamRepo.create).not.toHaveBeenCalled();
  });

  it('creates and returns team when trainer exists', async () => {
    trainerRepo.findById.mockResolvedValue(makeTrainer());
    teamRepo.create.mockResolvedValue(makeTeam());

    const result = await useCase.execute('Dream Team', 'trainer-1');

    expect(teamRepo.create).toHaveBeenCalledWith({ name: 'Dream Team', trainerId: 'trainer-1' });
    expect(result.name).toBe('Dream Team');
  });
});
