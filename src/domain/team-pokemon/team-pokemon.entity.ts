import { Pokemon } from '../pokemon/pokemon.entity';

export class TeamPokemon {
  constructor(
    public readonly id: string,
    public readonly teamId: string,
    public readonly pokemonId: string,
    public slot: number,
    public nickname: string | null,
    public readonly addedAt: Date,
    public pokemon?: Pokemon,
  ) {}
}
