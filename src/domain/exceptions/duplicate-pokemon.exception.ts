import { DomainException } from './domain.exception';

export class DuplicatePokemonException extends DomainException {
  constructor() {
    super('Pokémon already in team');
  }
}
