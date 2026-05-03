import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonOrmEntity } from '../entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../entities/pokemon-type.orm-entity';
import { PokemonMapper } from '../mappers/pokemon.mapper';
import {
  PokemonRepositoryPort,
  UpsertPokemonData,
  PokemonPage,
} from '../../../../domain/pokemon/pokemon.repository.port';
import { Pokemon } from '../../../../domain/pokemon/pokemon.entity';
import { PokemonType, DamageRelations } from '../../../../domain/pokemon/pokemon-type.entity';

@Injectable()
export class PokemonTypeOrmRepository implements PokemonRepositoryPort {
  constructor(
    @InjectRepository(PokemonOrmEntity)
    private readonly repo: Repository<PokemonOrmEntity>,
    @InjectRepository(PokemonTypeOrmEntity)
    private readonly typeRepo: Repository<PokemonTypeOrmEntity>,
  ) {}

  async upsertByPokeapiId(data: UpsertPokemonData): Promise<Pokemon> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(PokemonOrmEntity)
      .values({
        pokeapiId: data.pokeapiId,
        name: data.name,
        spriteUrl: data.spriteUrl,
        types: data.types,
        baseExperience: data.baseExperience,
        height: data.height,
        weight: data.weight,
        fetchedAt: data.fetchedAt,
        updatedAt: new Date(),
      })
      .orUpdate(
        [
          'name',
          'sprite_url',
          'types',
          'base_experience',
          'height',
          'weight',
          'fetched_at',
          'updated_at',
        ],
        ['pokeapi_id'],
      )
      .execute();

    const entity = await this.repo.findOneOrFail({ where: { pokeapiId: data.pokeapiId } });
    return PokemonMapper.toDomain(entity);
  }

  async findById(id: string): Promise<Pokemon | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? PokemonMapper.toDomain(entity) : null;
  }

  async findByPokeapiId(pokeapiId: number): Promise<Pokemon | null> {
    const entity = await this.repo.findOne({ where: { pokeapiId } });
    return entity ? PokemonMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Pokemon | null> {
    const entity = await this.repo.findOne({ where: { name } });
    return entity ? PokemonMapper.toDomain(entity) : null;
  }

  async findAll(limit: number, offset: number): Promise<PokemonPage> {
    const [data, total] = await this.repo.findAndCount({
      order: { name: 'ASC' },
      take: limit,
      skip: offset,
    });
    return { data: data.map(PokemonMapper.toDomain), total };
  }

  async upsertType(
    typeName: string,
    damageRelations: DamageRelations,
    fetchedAt: Date,
  ): Promise<PokemonType> {
    await this.typeRepo
      .createQueryBuilder()
      .insert()
      .into(PokemonTypeOrmEntity)
      .values({ typeName, damageRelations, fetchedAt })
      .orUpdate(['damage_relations', 'fetched_at'], ['type_name'])
      .execute();

    const entity = await this.typeRepo.findOneOrFail({ where: { typeName } });
    return PokemonMapper.typeToDomain(entity);
  }

  async findTypeByName(typeName: string): Promise<PokemonType | null> {
    const entity = await this.typeRepo.findOne({ where: { typeName } });
    return entity ? PokemonMapper.typeToDomain(entity) : null;
  }
}
