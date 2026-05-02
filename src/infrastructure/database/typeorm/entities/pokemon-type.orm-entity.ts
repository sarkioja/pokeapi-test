import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('pokemon_types')
export class PokemonTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'type_name', type: 'varchar', length: 50 })
  typeName: string;

  @Column({ name: 'damage_relations', type: 'jsonb' })
  damageRelations: object;

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt: Date;
}
