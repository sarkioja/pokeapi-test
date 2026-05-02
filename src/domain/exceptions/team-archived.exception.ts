import { DomainException } from './domain.exception';

export class TeamArchivedException extends DomainException {
  constructor() {
    super('Cannot add Pokémon to an archived team');
  }
}
