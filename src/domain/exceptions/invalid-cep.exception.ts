import { DomainException } from './domain.exception';

export class InvalidCepException extends DomainException {
  constructor(cep: string) {
    super(`Invalid CEP format: "${cep}". CEP must contain exactly 8 digits`);
  }
}
