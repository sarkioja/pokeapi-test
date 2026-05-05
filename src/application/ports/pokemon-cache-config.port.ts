export interface PokemonCacheConfigPort {
  getPokemonTtlHours(): number;
  getPokemonTypeTtlDays(): number;
}
