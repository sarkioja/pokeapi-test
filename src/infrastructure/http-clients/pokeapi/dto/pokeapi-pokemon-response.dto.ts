export interface PokeApiPokemonResponseDto {
  id: number;
  name: string;
  base_experience: number | null;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
  };
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
}

export interface PokeApiTypeResponseDto {
  name: string;
  damage_relations: {
    double_damage_to: Array<{ name: string }>;
    half_damage_to: Array<{ name: string }>;
    no_damage_to: Array<{ name: string }>;
    double_damage_from: Array<{ name: string }>;
    half_damage_from: Array<{ name: string }>;
    no_damage_from: Array<{ name: string }>;
  };
}
