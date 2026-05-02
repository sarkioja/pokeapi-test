import { Pokemon } from './pokemon.entity';
import { PokemonType } from './pokemon-type.entity';

export interface UpsertPokemonData {
  pokeapiId: number;
  name: string;
  spriteUrl: string | null;
  types: string[];
  baseExperience: number | null;
  height: number | null;
  weight: number | null;
  fetchedAt: Date;
}

export interface PokemonPage {
  data: Pokemon[];
  total: number;
}

export const POKEMON_REPOSITORY = 'POKEMON_REPOSITORY';

export interface PokemonRepositoryPort {
  upsertByPokeapiId(data: UpsertPokemonData): Promise<Pokemon>;
  findById(id: string): Promise<Pokemon | null>;
  findByPokeapiId(pokeapiId: number): Promise<Pokemon | null>;
  findByName(name: string): Promise<Pokemon | null>;
  findAll(limit: number, offset: number): Promise<PokemonPage>;
  upsertType(typeName: string, damageRelations: PokemonType['damageRelations'], fetchedAt: Date): Promise<PokemonType>;
  findTypeByName(typeName: string): Promise<PokemonType | null>;
}
