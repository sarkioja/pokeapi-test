import { UpdateTrainerUseCase } from './update-trainer.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';

const makeTrainer = (email = 'ash@pokemon.com'): Trainer =>
  new Trainer(
    'id-1',
    'Ash Ketchum',
    email,
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
  restoreWithTeams: jest.fn(),
  existsActiveByEmail: jest.fn(),
});

describe('UpdateTrainerUseCase', () => {
  let useCase: UpdateTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new UpdateTrainerUseCase(repo);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-1', { name: 'Ash' })).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws EmailConflictException when new email is already taken', async () => {
    repo.findById.mockResolvedValue(makeTrainer());
    repo.existsActiveByEmail.mockResolvedValue(true);

    await expect(useCase.execute('id-1', { email: 'taken@pokemon.com' })).rejects.toBeInstanceOf(
      EmailConflictException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('skips email check when email is not being updated', async () => {
    repo.findById.mockResolvedValue(makeTrainer());
    repo.update.mockResolvedValue(makeTrainer());

    await useCase.execute('id-1', { name: 'New Name' });

    expect(repo.existsActiveByEmail).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith('id-1', { name: 'New Name' });
  });

  it('updates and returns trainer when new email is available', async () => {
    const updated = makeTrainer('new@pokemon.com');
    repo.findById.mockResolvedValue(makeTrainer());
    repo.existsActiveByEmail.mockResolvedValue(false);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('id-1', { email: 'new@pokemon.com' });

    expect(repo.existsActiveByEmail).toHaveBeenCalledWith('new@pokemon.com', 'id-1');
    expect(result.email).toBe('new@pokemon.com');
  });
});
