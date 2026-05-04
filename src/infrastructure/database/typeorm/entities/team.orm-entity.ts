import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TrainerOrmEntity } from './trainer.orm-entity';
import { TeamPokemonOrmEntity } from './team-pokemon.orm-entity';

@Entity('teams')
@Index(['trainerId'])
export class TeamOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  declare status: string;

  @Column({ name: 'trainer_id', type: 'uuid', nullable: true })
  declare trainerId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  declare deletedAt: Date | null;

  @ManyToOne(() => TrainerOrmEntity, (trainer) => trainer.teams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'trainer_id' })
  declare trainer: TrainerOrmEntity;

  @OneToMany(() => TeamPokemonOrmEntity, (tp) => tp.team)
  declare teamPokemon: TeamPokemonOrmEntity[];
}
