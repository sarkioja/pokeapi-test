import { CreateTrainerUseCase } from './create-trainer.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';
import { Trainer } from '../../../domain/trainer/trainer.entity';

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

describe('CreateTrainerUseCase', () => {
  let useCase: CreateTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new CreateTrainerUseCase(repo);
  });

  it('creates trainer when email is not taken', async () => {
    repo.existsActiveByEmail.mockResolvedValue(false);
    repo.create.mockResolvedValue(makeTrainer());

    const result = await useCase.execute({ name: 'Ash Ketchum', email: 'ash@pokemon.com' });

    expect(repo.existsActiveByEmail).toHaveBeenCalledWith('ash@pokemon.com');
    expect(repo.create).toHaveBeenCalledWith({ name: 'Ash Ketchum', email: 'ash@pokemon.com' });
    expect(result.email).toBe('ash@pokemon.com');
  });

  it('throws EmailConflictException when email is already in use', async () => {
    repo.existsActiveByEmail.mockResolvedValue(true);

    await expect(useCase.execute({ name: 'Ash', email: 'ash@pokemon.com' })).rejects.toBeInstanceOf(
      EmailConflictException,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });
});
