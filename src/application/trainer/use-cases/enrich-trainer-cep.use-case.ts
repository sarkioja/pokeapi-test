import { Inject } from '@nestjs/common';
import { Trainer } from '../../../domain/trainer/trainer.entity';
import { TRAINER_REPOSITORY, TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { VIACEP_PORT, ViaCepPort } from '../../../domain/ports/viacep.port';
import { CepVO } from '../../../domain/trainer/value-objects/cep.vo';
import { ResourceNotFoundException } from '../../../domain/exceptions/external-service.exception';

export class EnrichTrainerCepUseCase {
  constructor(
    @Inject(TRAINER_REPOSITORY)
    private readonly trainerRepository: TrainerRepositoryPort,
    @Inject(VIACEP_PORT)
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
