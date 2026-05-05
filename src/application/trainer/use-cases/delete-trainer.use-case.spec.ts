import { DeleteTrainerUseCase } from './delete-trainer.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';

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
  softDeleteWithTeams: jest.fn(),
  restore: jest.fn(),
  restoreWithTeams: jest.fn(),
  existsActiveByEmail: jest.fn(),
});

describe('DeleteTrainerUseCase', () => {
  let useCase: DeleteTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new DeleteTrainerUseCase(repo);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id')).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(repo.softDeleteWithTeams).not.toHaveBeenCalled();
  });

  it('delegates cascading soft delete to the trainer repository', async () => {
    repo.findById.mockResolvedValue(makeTrainer());

    await useCase.execute('id-1');

    expect(repo.softDeleteWithTeams).toHaveBeenCalledWith('id-1');
  });
});
