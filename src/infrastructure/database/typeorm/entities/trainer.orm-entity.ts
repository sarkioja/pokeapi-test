import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { TeamOrmEntity } from './team.orm-entity';

@Entity('trainers')
export class TrainerOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  cep: string | null;

  @Column({ name: 'address_street', type: 'varchar', length: 255, nullable: true })
  addressStreet: string | null;

  @Column({ name: 'address_neighborhood', type: 'varchar', length: 255, nullable: true })
  addressNeighborhood: string | null;

  @Column({ name: 'address_city', type: 'varchar', length: 255, nullable: true })
  addressCity: string | null;

  @Column({ name: 'address_state', type: 'varchar', length: 2, nullable: true })
  addressState: string | null;

  @Column({ name: 'address_country', type: 'varchar', length: 255, nullable: true })
  addressCountry: string | null;

  @Column({ name: 'favorite_pokeapi_id', type: 'integer', nullable: true })
  favoritePokeapiId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => TeamOrmEntity, (team) => team.trainer)
  teams: TeamOrmEntity[];
}
