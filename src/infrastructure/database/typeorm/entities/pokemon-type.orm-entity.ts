import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { DamageRelations } from '../../../../domain/pokemon/pokemon-type.entity';

@Entity('pokemon_types')
export class PokemonTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Index({ unique: true })
  @Column({ name: 'type_name', type: 'varchar', length: 50 })
  declare typeName: string;

  @Column({ name: 'damage_relations', type: 'jsonb' })
  declare damageRelations: DamageRelations;

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  declare fetchedAt: Date;
}
