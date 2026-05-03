import { Pokemon } from '../../../../domain/pokemon/pokemon.entity';
import { PokemonType } from '../../../../domain/pokemon/pokemon-type.entity';
import { PokemonOrmEntity } from '../entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../entities/pokemon-type.orm-entity';

export class PokemonMapper {
  static toDomain(orm: PokemonOrmEntity): Pokemon {
    return new Pokemon(
      orm.id,
      orm.pokeapiId,
      orm.name,
      orm.spriteUrl,
      orm.types,
      orm.baseExperience,
      orm.height,
      orm.weight,
      orm.fetchedAt,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static typeToDomain(orm: PokemonTypeOrmEntity): PokemonType {
    return new PokemonType(orm.id, orm.typeName, orm.damageRelations, orm.fetchedAt);
  }
}
