import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamOrmEntity } from '../entities/team.orm-entity';
import { TeamMapper } from '../mappers/team.mapper';
import {
  TeamRepositoryPort,
  CreateTeamData,
  UpdateTeamData,
  TeamPage,
} from '../../../../domain/team/team.repository.port';
import { Team } from '../../../../domain/team/team.entity';
import { ResourceNotFoundException } from '../../../../domain/exceptions/resource-not-found.exception';

@Injectable()
export class TeamTypeOrmRepository implements TeamRepositoryPort {
  constructor(
    @InjectRepository(TeamOrmEntity)
    private readonly repo: Repository<TeamOrmEntity>,
  ) {}

  async create(data: CreateTeamData): Promise<Team> {
    const entity = this.repo.create({
      name: data.name,
      trainerId: data.trainerId,
      status: 'active',
    });
    const saved = await this.repo.save(entity);
    return TeamMapper.toDomain({ ...saved, teamPokemon: [] });
  }

  async findById(id: string): Promise<Team | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TeamMapper.toDomain({ ...entity, teamPokemon: [] }) : null;
  }

  async findByIdWithPokemon(id: string): Promise<Team | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['teamPokemon', 'teamPokemon.pokemon'],
    });
    return entity ? TeamMapper.toDomain(entity) : null;
  }

  async findByTrainerId(trainerId: string, limit: number, offset: number): Promise<TeamPage> {
    const [data, total] = await this.repo.findAndCount({
      where: { trainerId },
      relations: ['teamPokemon', 'teamPokemon.pokemon'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
    return { data: data.map((e) => TeamMapper.toDomain(e)), total };
  }

  async update(id: string, data: UpdateTeamData): Promise<Team> {
    await this.repo.update(id, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.status !== undefined && { status: data.status }),
    });
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new ResourceNotFoundException('Team', id);
    return TeamMapper.toDomain({ ...updated, teamPokemon: [] });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async softDeleteByTrainerId(trainerId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .softDelete()
      .where('trainer_id = :trainerId', { trainerId })
      .execute();
  }

  async addPokemon(
    teamId: string,
    pokemonId: string,
    slot: number,
    nickname?: string,
  ): Promise<void> {
    await this.repo.manager.query(
      `INSERT INTO team_pokemon (id, team_id, pokemon_id, slot, nickname, added_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, now())`,
      [teamId, pokemonId, slot, nickname ?? null],
    );
  }

  async removePokemon(teamId: string, slotId: string): Promise<void> {
    const result = await this.repo.manager.query(
      `DELETE FROM team_pokemon WHERE id = $1 AND team_id = $2`,
      [slotId, teamId],
    );
    if (result[1] === 0) throw new ResourceNotFoundException('TeamPokemon', slotId);
  }
}
