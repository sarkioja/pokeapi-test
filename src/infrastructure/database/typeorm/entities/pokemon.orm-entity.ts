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
  declare id: string;

  @Index({ unique: true })
  @Column({ name: 'pokeapi_id', type: 'integer' })
  declare pokeapiId: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ name: 'sprite_url', type: 'varchar', length: 512, nullable: true })
  declare spriteUrl: string | null;

  @Column({ type: 'jsonb', default: [] })
  declare types: string[];

  @Column({ name: 'base_experience', type: 'integer', nullable: true })
  declare baseExperience: number | null;

  @Column({ type: 'integer', nullable: true })
  declare height: number | null;

  @Column({ type: 'integer', nullable: true })
  declare weight: number | null;

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  declare fetchedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;

  @OneToMany(() => TeamPokemonOrmEntity, (tp) => tp.pokemon)
  declare teamPokemon: TeamPokemonOrmEntity[];
}
