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
  declare id: string;

  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ type: 'varchar', length: 255 })
  declare email: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  declare cep: string | null;

  @Column({ name: 'address_street', type: 'varchar', length: 255, nullable: true })
  declare addressStreet: string | null;

  @Column({ name: 'address_neighborhood', type: 'varchar', length: 255, nullable: true })
  declare addressNeighborhood: string | null;

  @Column({ name: 'address_city', type: 'varchar', length: 255, nullable: true })
  declare addressCity: string | null;

  @Column({ name: 'address_state', type: 'varchar', length: 2, nullable: true })
  declare addressState: string | null;

  @Column({ name: 'address_country', type: 'varchar', length: 255, nullable: true })
  declare addressCountry: string | null;

  @Column({ name: 'favorite_pokeapi_id', type: 'integer', nullable: true })
  declare favoritePokeapiId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  declare deletedAt: Date | null;

  @OneToMany(() => TeamOrmEntity, (team) => team.trainer)
  declare teams: TeamOrmEntity[];
}
