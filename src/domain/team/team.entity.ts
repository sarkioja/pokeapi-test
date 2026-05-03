import { TeamPokemon } from '../team-pokemon/team-pokemon.entity';

export type TeamStatus = 'active' | 'archived';

export class Team {
  constructor(
    public readonly id: string,
    public name: string,
    public status: TeamStatus,
    public readonly trainerId: string | null,
    public pokemon: TeamPokemon[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  isArchived(): boolean {
    return this.status === 'archived';
  }

  isFull(): boolean {
    return this.pokemon.length >= 5;
  }

  hasPokemon(pokemonId: string): boolean {
    return this.pokemon.some((tp) => tp.pokemonId === pokemonId);
  }

  hasSlot(slotId: string): boolean {
    return this.pokemon.some((tp) => tp.id === slotId);
  }
}
