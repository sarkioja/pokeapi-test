import { AddressData } from '../shared/address-data';

export interface ViaCepPort {
  lookup(cep: string): Promise<AddressData>;
}
