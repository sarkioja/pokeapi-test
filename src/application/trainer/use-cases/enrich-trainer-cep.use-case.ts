import { Trainer } from '../../../domain/trainer/trainer.entity';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ViaCepPort } from '../../../domain/ports/viacep.port';
import { CepVO } from '../../../domain/trainer/value-objects/cep.vo';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class EnrichTrainerCepUseCase {
  constructor(
    private readonly trainerRepository: TrainerRepositoryPort,
    private readonly viaCep: ViaCepPort,
  ) {}

  async execute(id: string, rawCep: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findById(id);
    if (!trainer) throw new ResourceNotFoundException('Trainer', id);

    const cep = CepVO.validate(rawCep);
    const address = await this.viaCep.lookup(cep);

    return this.trainerRepository.updateAddress(id, address);
  }
}
