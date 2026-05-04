import { TeamPokemon } from '../team-pokemon/team-pokemon.entity';
import { DuplicatePokemonException } from '../exceptions/duplicate-pokemon.exception';
import { TeamArchivedException } from '../exceptions/team-archived.exception';
import { TeamFullException } from '../exceptions/team-full.exception';

export type TeamStatus = 'active' | 'archived';

export const MAX_TEAM_SIZE = 5;

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
    return this.pokemon.length >= MAX_TEAM_SIZE;
  }

  hasPokemon(pokemonId: string): boolean {
    return this.pokemon.some((tp) => tp.pokemonId === pokemonId);
  }

  hasSlot(slotId: string): boolean {
    return this.pokemon.some((tp) => tp.id === slotId);
  }

  assertCanAddPokemon(pokemonId: string): void {
    this.assertCanReceivePokemon();
    if (this.hasPokemon(pokemonId)) throw new DuplicatePokemonException();
  }

  assertCanReceivePokemon(): void {
    if (this.isArchived()) throw new TeamArchivedException();
    if (this.isFull()) throw new TeamFullException();
  }

  nextAvailableSlot(): number {
    const usedSlots = new Set(this.pokemon.map((tp) => tp.slot));
    let nextSlot = 1;
    while (usedSlots.has(nextSlot)) nextSlot++;
    return nextSlot;
  }
}
