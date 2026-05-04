import { GetTrainerUseCase } from './get-trainer.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makeTrainer = (): Trainer =>
  new Trainer(
    'id-1',
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

const makeRepo = (): jest.Mocked<TrainerRepositoryPort> => ({
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

describe('GetTrainerUseCase', () => {
  let useCase: GetTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new GetTrainerUseCase(repo);
  });

  describe('findById', () => {
    it('returns trainer when found', async () => {
      repo.findById.mockResolvedValue(makeTrainer());

      const result = await useCase.findById('id-1');

      expect(repo.findById).toHaveBeenCalledWith('id-1');
      expect(result.id).toBe('id-1');
    });

    it('throws ResourceNotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(useCase.findById('id-1')).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns paginated trainers', async () => {
      const page = { data: [makeTrainer()], total: 1 };
      repo.findAll.mockResolvedValue(page);

      const result = await useCase.findAll(10, 0);

      expect(repo.findAll).toHaveBeenCalledWith(10, 0);
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });
});
