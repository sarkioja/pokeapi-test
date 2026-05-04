import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainerOrmEntity } from '../entities/trainer.orm-entity';
import { TeamOrmEntity } from '../entities/team.orm-entity';
import { TrainerMapper } from '../mappers/trainer.mapper';
import {
  TrainerRepositoryPort,
  CreateTrainerData,
  UpdateTrainerData,
  TrainerPage,
} from '../../../../domain/trainer/trainer.repository.port';
import { AddressData } from '../../../../domain/shared/address-data';
import { Trainer } from '../../../../domain/trainer/trainer.entity';
import { ResourceNotFoundException } from '../../../../domain/exceptions/resource-not-found.exception';

@Injectable()
export class TrainerTypeOrmRepository implements TrainerRepositoryPort {
  constructor(
    @InjectRepository(TrainerOrmEntity)
    private readonly repo: Repository<TrainerOrmEntity>,
  ) {}

  async create(data: CreateTrainerData): Promise<Trainer> {
    const entity = this.repo.create({
      name: data.name,
      email: data.email,
      favoritePokeapiId: data.favoritePokeapiId ?? null,
    });
    const saved = await this.repo.save(entity);
    return TrainerMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Trainer | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TrainerMapper.toDomain(entity) : null;
  }

  async findWithDeletedById(id: string): Promise<Trainer | null> {
    const entity = await this.repo.findOne({ where: { id }, withDeleted: true });
    return entity ? TrainerMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Trainer | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? TrainerMapper.toDomain(entity) : null;
  }

  async findAll(limit: number, offset: number): Promise<TrainerPage> {
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
    return { data: data.map(TrainerMapper.toDomain), total };
  }

  async update(id: string, data: UpdateTrainerData): Promise<Trainer> {
    await this.repo.update(id, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.favoritePokeapiId !== undefined && { favoritePokeapiId: data.favoritePokeapiId }),
    });
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new ResourceNotFoundException('Trainer', id);
    return TrainerMapper.toDomain(updated);
  }

  async updateAddress(id: string, address: AddressData): Promise<Trainer> {
    await this.repo.update(id, {
      cep: address.cep,
      addressStreet: address.street,
      addressNeighborhood: address.neighborhood,
      addressCity: address.city,
      addressState: address.state,
      addressCountry: 'Brazil',
    });
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new ResourceNotFoundException('Trainer', id);
    return TrainerMapper.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async softDeleteWithTeams(id: string): Promise<void> {
    const deletedAt = new Date();
    await this.repo.manager.transaction(async (manager) => {
      await manager.query(
        `UPDATE teams SET deleted_at = $1 WHERE trainer_id = $2 AND deleted_at IS NULL`,
        [deletedAt, id],
      );
      await manager.query(`UPDATE trainers SET deleted_at = $1 WHERE id = $2`, [deletedAt, id]);
    });
  }

  async restore(id: string): Promise<Trainer> {
    await this.repo.restore(id);
    const restored = await this.repo.findOne({ where: { id } });
    if (!restored) throw new ResourceNotFoundException('Trainer', id);
    return TrainerMapper.toDomain(restored);
  }

  async restoreWithTeams(id: string): Promise<Trainer> {
    await this.repo.manager.transaction(async (manager) => {
      const trainerOrm = await manager.findOne(TrainerOrmEntity, {
        where: { id },
        withDeleted: true,
      });

      await manager
        .getRepository(TeamOrmEntity)
        .createQueryBuilder()
        .restore()
        .where('trainer_id = :id', { id })
        .andWhere('deleted_at = :deletedAt', { deletedAt: trainerOrm!.deletedAt })
        .execute();

      await manager.restore(TrainerOrmEntity, id);
    });

    const restored = await this.repo.findOne({ where: { id } });
    if (!restored) throw new ResourceNotFoundException('Trainer', id);
    return TrainerMapper.toDomain(restored);
  }

  async existsActiveByEmail(email: string, excludeId?: string): Promise<boolean> {
    const qb = this.repo
      .createQueryBuilder('trainer')
      .where('trainer.email = :email', { email })
      .andWhere('trainer.deleted_at IS NULL');

    if (excludeId) {
      qb.andWhere('trainer.id != :excludeId', { excludeId });
    }

    return (await qb.getCount()) > 0;
  }
}
