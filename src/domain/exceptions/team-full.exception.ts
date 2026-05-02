import { DomainException } from './domain.exception';

export class TeamFullException extends DomainException {
  constructor() {
    super('Team is full (max 5 Pokémon)');
  }
}
