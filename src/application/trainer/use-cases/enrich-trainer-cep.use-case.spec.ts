import { EnrichTrainerCepUseCase } from './enrich-trainer-cep.use-case';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ViaCepPort } from '../../../domain/ports/viacep.port';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';
import { InvalidCepException } from '../../../domain/exceptions/invalid-cep.exception';

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

const ADDRESS = {
  cep: '01310100',
  street: 'Avenida Paulista',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
};

describe('EnrichTrainerCepUseCase', () => {
  let useCase: EnrichTrainerCepUseCase;
  let repo: jest.Mocked<TrainerRepositoryPort>;
  let viaCep: jest.Mocked<ViaCepPort>;

  beforeEach(() => {
    repo = makeRepo();
    viaCep = { lookup: jest.fn() };
    useCase = new EnrichTrainerCepUseCase(repo, viaCep);
  });

  it('throws ResourceNotFoundException when trainer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id', '01310100')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(viaCep.lookup).not.toHaveBeenCalled();
  });

  it('throws InvalidCepException when CEP format is invalid', async () => {
    repo.findById.mockResolvedValue(makeTrainer());

    await expect(useCase.execute('id-1', '123')).rejects.toBeInstanceOf(InvalidCepException);
    expect(viaCep.lookup).not.toHaveBeenCalled();
  });

  it('enriches trainer address when CEP is valid', async () => {
    const enriched = { ...makeTrainer(), addressCity: 'São Paulo', addressState: 'SP' } as Trainer;
    repo.findById.mockResolvedValue(makeTrainer());
    viaCep.lookup.mockResolvedValue(ADDRESS);
    repo.updateAddress.mockResolvedValue(enriched);

    const result = await useCase.execute('id-1', '01310100');

    expect(viaCep.lookup).toHaveBeenCalledWith('01310100');
    expect(repo.updateAddress).toHaveBeenCalledWith('id-1', ADDRESS);
    expect(result.addressCity).toBe('São Paulo');
  });

  it('strips hyphen from CEP before lookup', async () => {
    repo.findById.mockResolvedValue(makeTrainer());
    viaCep.lookup.mockResolvedValue(ADDRESS);
    repo.updateAddress.mockResolvedValue(makeTrainer());

    await useCase.execute('id-1', '01310-100');

    expect(viaCep.lookup).toHaveBeenCalledWith('01310100');
  });

  it('propagates error when ViaCEP cannot find the CEP', async () => {
    repo.findById.mockResolvedValue(makeTrainer());
    viaCep.lookup.mockRejectedValue(new Error('CEP not found'));

    await expect(useCase.execute('id-1', '00000000')).rejects.toThrow('CEP not found');
    expect(repo.updateAddress).not.toHaveBeenCalled();
  });
});
