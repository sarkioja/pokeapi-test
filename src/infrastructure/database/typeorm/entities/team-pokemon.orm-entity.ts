import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TeamOrmEntity } from './team.orm-entity';
import { PokemonOrmEntity } from './pokemon.orm-entity';

@Entity('team_pokemon')
@Unique(['teamId', 'pokemonId'])
@Unique(['teamId', 'slot'])
export class TeamPokemonOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ name: 'team_id', type: 'uuid' })
  declare teamId: string;

  @Column({ name: 'pokemon_id', type: 'uuid' })
  declare pokemonId: string;

  @Column({ type: 'integer' })
  declare slot: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  declare nickname: string | null;

  @CreateDateColumn({ name: 'added_at' })
  declare addedAt: Date;

  @ManyToOne(() => TeamOrmEntity, (team) => team.teamPokemon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  declare team: TeamOrmEntity;

  @ManyToOne(() => PokemonOrmEntity, (pokemon) => pokemon.teamPokemon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pokemon_id' })
  declare pokemon: PokemonOrmEntity;
}
