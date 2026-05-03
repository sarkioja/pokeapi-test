export interface DamageRelations {
  doubleDamageTo: string[];
  halfDamageTo: string[];
  noDamageTo: string[];
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
}

export class PokemonType {
  constructor(
    public readonly id: string,
    public readonly typeName: string,
    public damageRelations: DamageRelations,
    public fetchedAt: Date,
  ) {}
}
