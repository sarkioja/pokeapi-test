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
  restore: jest.fn(),
  existsActiveByEmail: jest.fn(),
});

const deletedAt = new Date('2026-01-01T00:00:00Z');

const makeDataSource = () => {
  const manager = {
    query: jest
      .fn()
      .mockResolvedValueOnce([{ deleted_at: deletedAt }])
      .mockResolvedValue(undefined),
  };
  return {
    transaction: jest.fn().mockImplementation((cb: (m: typeof manager) => Promise<void>) =>
      cb(manager),
    ),
    _manager: manager,
  };
};

describe('RestoreTrainerUseCase', () => {
  let useCase: RestoreTrainerUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;
  let dataSource: ReturnType<typeof makeDataSource>;

  beforeEach(() => {
    repo = makeRepo();
    dataSource = makeDataSource();
    useCase = new RestoreTrainerUseCase(repo, dataSource as any);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    repo.findWithDeletedById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id')).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(repo.existsActiveByEmail).not.toHaveBeenCalled();
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('throws EmailConflictException when email is taken by another active trainer', async () => {
    repo.findWithDeletedById.mockResolvedValue(makeTrainer());
    repo.existsActiveByEmail.mockResolvedValue(true);

    await expect(useCase.execute('id-1')).rejects.toBeInstanceOf(EmailConflictException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('restores trainer and teams deleted at the same timestamp', async () => {
    const trainer = makeTrainer();
    repo.findWithDeletedById.mockResolvedValue(trainer);
    repo.existsActiveByEmail.mockResolvedValue(false);
    repo.findById.mockResolvedValue(trainer);

    const result = await useCase.execute('id-1');

    expect(dataSource.transaction).toHaveBeenCalled();

    const queries: [string, unknown[]][] = dataSource._manager.query.mock.calls;
    expect(queries[0][0]).toContain('SELECT deleted_at FROM trainers');
    expect(queries[0][1]).toEqual(['id-1']);

    expect(queries[1][0]).toContain('UPDATE teams SET deleted_at = NULL');
    expect(queries[1][1]).toEqual(['id-1', deletedAt]);

    expect(queries[2][0]).toContain('UPDATE trainers SET deleted_at = NULL');
    expect(queries[2][1]).toEqual(['id-1']);

    expect(repo.findById).toHaveBeenCalledWith('id-1');
    expect(result.id).toBe('id-1');
  });

  it('does not restore teams deleted independently before trainer deletion', async () => {
    const trainer = makeTrainer();
    repo.findWithDeletedById.mockResolvedValue(trainer);
    repo.existsActiveByEmail.mockResolvedValue(false);
    repo.findById.mockResolvedValue(trainer);

    await useCase.execute('id-1');

    // The UPDATE teams query uses the exact deleted_at timestamp as a filter,
    // so teams with a different deleted_at are untouched by design.
    const teamsUpdateCall: [string, unknown[]] = dataSource._manager.query.mock.calls[1];
    expect(teamsUpdateCall[1][1]).toBe(deletedAt);
  });
});
