import { RestoreTrainerUseCase } from './restore-trainer.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { EmailConflictException } from '../../../domain/exceptions/email-conflict.exception';

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

describe('RestoreTrainerUseCase', () => {
  let useCase: RestoreTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new RestoreTrainerUseCase(repo);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    repo.findWithDeletedById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id')).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(repo.existsActiveByEmail).not.toHaveBeenCalled();
    expect(repo.restoreWithTeams).not.toHaveBeenCalled();
  });

  it('throws EmailConflictException when email is taken by another active trainer', async () => {
    repo.findWithDeletedById.mockResolvedValue(makeTrainer());
    repo.existsActiveByEmail.mockResolvedValue(true);

    await expect(useCase.execute('id-1')).rejects.toBeInstanceOf(EmailConflictException);
    expect(repo.restoreWithTeams).not.toHaveBeenCalled();
  });

  it('restores trainer and associated teams', async () => {
    const trainer = makeTrainer();
    repo.findWithDeletedById.mockResolvedValue(trainer);
    repo.existsActiveByEmail.mockResolvedValue(false);
    repo.restoreWithTeams.mockResolvedValue(trainer);

    const result = await useCase.execute('id-1');

    expect(repo.existsActiveByEmail).toHaveBeenCalledWith('ash@pokemon.com', 'id-1');
    expect(repo.restoreWithTeams).toHaveBeenCalledWith('id-1');
    expect(result.id).toBe('id-1');
  });
});
