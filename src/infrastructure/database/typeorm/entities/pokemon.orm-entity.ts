import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { TeamPokemonOrmEntity } from './team-pokemon.orm-entity';

@Entity('pokemon')
export class PokemonOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'pokeapi_id', type: 'integer' })
  pokeapiId: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'sprite_url', type: 'varchar', length: 512, nullable: true })
  spriteUrl: string | null;

  @Column({ type: 'jsonb', default: [] })
  types: string[];

  @Column({ name: 'base_experience', type: 'integer', nullable: true })
  baseExperience: number | null;

  @Column({ type: 'integer', nullable: true })
  height: number | null;

  @Column({ type: 'integer', nullable: true })
  weight: number | null;

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TeamPokemonOrmEntity, (tp) => tp.pokemon)
  teamPokemon: TeamPokemonOrmEntity[];
}
