import { DeleteTrainerUseCase } from './delete-trainer.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

const makeTrainer = (): Trainer =>
  new Trainer(
    'id-1',
    'Ash',
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
  restore: jest.fn(),
  existsActiveByEmail: jest.fn(),
});

describe('DeleteTrainerUseCase', () => {
  let useCase: DeleteTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;
  let mockManager: { query: jest.Mock };
  let mockDataSource: { transaction: jest.Mock };

  beforeEach(() => {
    repo = makeRepo();
    mockManager = { query: jest.fn() };
    mockDataSource = {
      transaction: jest.fn(async (cb: (manager: typeof mockManager) => Promise<void>) =>
        cb(mockManager),
      ),
    };
    useCase = new DeleteTrainerUseCase(repo, mockDataSource as any);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id')).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('soft-deletes trainer and cascades to teams in a single transaction', async () => {
    repo.findById.mockResolvedValue(makeTrainer());

    await useCase.execute('id-1');

    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    expect(mockManager.query).toHaveBeenCalledTimes(2);
    expect(mockManager.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE teams'),
      expect.arrayContaining(['id-1']),
    );
    expect(mockManager.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE trainers'),
      expect.arrayContaining(['id-1']),
    );
  });
});
