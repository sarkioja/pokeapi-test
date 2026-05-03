import { AddressData } from '../shared/address-data';

export const VIACEP_PORT = 'VIACEP_PORT';

export interface ViaCepPort {
  lookup(cep: string): Promise<AddressData>;
}
