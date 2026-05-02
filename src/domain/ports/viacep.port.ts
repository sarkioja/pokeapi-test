import { AddressData } from '../trainer/trainer.repository.port';

export const VIACEP_PORT = 'VIACEP_PORT';

export interface ViaCepPort {
  lookup(cep: string): Promise<AddressData>;
}
