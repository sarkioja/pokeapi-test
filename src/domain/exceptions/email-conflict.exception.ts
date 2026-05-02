import { DomainException } from './domain.exception';

export class EmailConflictException extends DomainException {
  constructor(email: string) {
    super(`Email "${email}" is already in use`);
  }
}
