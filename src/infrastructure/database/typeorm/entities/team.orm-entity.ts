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
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'trainer_id', type: 'uuid', nullable: true })
  trainerId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => TrainerOrmEntity, (trainer) => trainer.teams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'trainer_id' })
  trainer: TrainerOrmEntity;

  @OneToMany(() => TeamPokemonOrmEntity, (tp) => tp.team)
  teamPokemon: TeamPokemonOrmEntity[];
}
