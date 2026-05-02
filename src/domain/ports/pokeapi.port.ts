import { DamageRelations } from '../pokemon/pokemon-type.entity';

export interface PokeApiPokemonData {
  pokeapiId: number;
  name: string;
  spriteUrl: string | null;
  types: string[];
  baseExperience: number | null;
  height: number | null;
  weight: number | null;
}

export const POKEAPI_PORT = 'POKEAPI_PORT';

export interface PokeApiPort {
  fetchPokemonByName(name: string): Promise<PokeApiPokemonData>;
  fetchPokemonById(pokeapiId: number): Promise<PokeApiPokemonData>;
  fetchTypeEffectiveness(typeName: string): Promise<DamageRelations>;
}
