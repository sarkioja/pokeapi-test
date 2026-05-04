import { GetTeamUseCase } from './get-team.use-case';
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
  softDeleteWithTeams: jest.fn(),
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

describe('GetTeamUseCase', () => {
  let useCase: GetTeamUseCase;
  let teamRepo: jest.Mocked<TeamRepositoryPort>;
  let trainerRepo: jest.Mocked<TrainerRepositoryPort>;

  beforeEach(() => {
    teamRepo = makeTeamRepo();
    trainerRepo = makeTrainerRepo();
    useCase = new GetTeamUseCase(teamRepo, trainerRepo);
  });

  describe('findById', () => {
    it('returns team when found', async () => {
      teamRepo.findByIdWithPokemon.mockResolvedValue(makeTeam());

      const result = await useCase.findById('team-1');

      expect(teamRepo.findByIdWithPokemon).toHaveBeenCalledWith('team-1');
      expect(result.id).toBe('team-1');
    });

    it('throws ResourceNotFoundException when team not found', async () => {
      teamRepo.findByIdWithPokemon.mockResolvedValue(null);

      await expect(useCase.findById('team-1')).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('findByTrainerId', () => {
    it('throws ResourceNotFoundException when trainer does not exist', async () => {
      trainerRepo.findById.mockResolvedValue(null);

      await expect(useCase.findByTrainerId('trainer-1', 10, 0)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
      expect(teamRepo.findByTrainerId).not.toHaveBeenCalled();
    });

    it('returns paginated teams when trainer exists', async () => {
      const page = { data: [makeTeam()], total: 1 };
      trainerRepo.findById.mockResolvedValue(makeTrainer());
      teamRepo.findByTrainerId.mockResolvedValue(page);

      const result = await useCase.findByTrainerId('trainer-1', 10, 0);

      expect(teamRepo.findByTrainerId).toHaveBeenCalledWith('trainer-1', 10, 0);
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });
});
