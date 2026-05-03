import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PokemonTypeOrmRepository } from './pokemon.typeorm-repository';
import { PokemonOrmEntity } from '../entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../entities/pokemon-type.orm-entity';
import { TeamPokemonOrmEntity } from '../entities/team-pokemon.orm-entity';
import { TeamOrmEntity } from '../entities/team.orm-entity';
import { TrainerOrmEntity } from '../entities/trainer.orm-entity';
import { DamageRelations } from '../../../../domain/pokemon/pokemon-type.entity';

const ALL_ENTITIES = [
  PokemonOrmEntity,
  PokemonTypeOrmEntity,
  TeamPokemonOrmEntity,
  TeamOrmEntity,
  TrainerOrmEntity,
];

const DB = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'pokeapi_dev',
  entities: ALL_ENTITIES,
  synchronize: false,
};

const PIKACHU_DATA = {
  pokeapiId: 25,
  name: 'pikachu',
  spriteUrl: 'https://pokeapi.co/media/sprites/pokemon/25.png',
  types: ['electric'],
  baseExperience: 112,
  height: 4,
  weight: 60,
  fetchedAt: new Date(),
};

const ELECTRIC_RELATIONS: DamageRelations = {
  doubleDamageTo: ['water', 'flying'],
  halfDamageTo: ['electric', 'grass', 'dragon'],
  noDamageTo: ['ground'],
  doubleDamageFrom: ['ground'],
  halfDamageFrom: ['electric', 'flying', 'steel'],
  noDamageFrom: [],
};

describe('PokemonTypeOrmRepository (integration)', () => {
  let module: TestingModule;
  let repo: PokemonTypeOrmRepository;
  let ds: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(DB), TypeOrmModule.forFeature(ALL_ENTITIES)],
      providers: [PokemonTypeOrmRepository],
    }).compile();

    repo = module.get(PokemonTypeOrmRepository);
    ds = module.get(getDataSourceToken());
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await ds.query('DELETE FROM team_pokemon');
    await ds.query('DELETE FROM pokemon');
    await ds.query('DELETE FROM pokemon_types');
  });

  it('upserts pokemon by pokeapi_id and finds by name', async () => {
    const pokemon = await repo.upsertByPokeapiId(PIKACHU_DATA);

    expect(pokemon.id).toBeDefined();
    expect(pokemon.name).toBe('pikachu');
    expect(pokemon.types).toEqual(['electric']);

    const found = await repo.findByName('pikachu');
    expect(found).not.toBeNull();
    expect(found!.pokeapiId).toBe(25);
  });

  it('upserts again updating fetchedAt (idempotent)', async () => {
    await repo.upsertByPokeapiId(PIKACHU_DATA);
    const newFetchedAt = new Date(Date.now() + 1000);
    await repo.upsertByPokeapiId({ ...PIKACHU_DATA, fetchedAt: newFetchedAt });

    const all = await repo.findAll(10, 0);
    expect(all.total).toBe(1); // no duplicate
    expect(all.data[0].fetchedAt.getTime()).toBeGreaterThanOrEqual(newFetchedAt.getTime() - 1000);
  });

  it('finds pokemon by pokeapi_id', async () => {
    await repo.upsertByPokeapiId(PIKACHU_DATA);

    const found = await repo.findByPokeapiId(25);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('pikachu');
  });

  it('paginates pokemon list', async () => {
    await repo.upsertByPokeapiId(PIKACHU_DATA);
    await repo.upsertByPokeapiId({ ...PIKACHU_DATA, pokeapiId: 6, name: 'charizard' });

    const page = await repo.findAll(1, 0);
    expect(page.total).toBe(2);
    expect(page.data).toHaveLength(1);
  });

  it('upserts and retrieves pokemon type damage relations', async () => {
    const fetchedAt = new Date();
    await repo.upsertType('electric', ELECTRIC_RELATIONS, fetchedAt);

    const type = await repo.findTypeByName('electric');
    expect(type).not.toBeNull();
    expect(type!.damageRelations.doubleDamageFrom).toContain('ground');
    expect(type!.damageRelations.halfDamageFrom).toContain('steel');
  });
});
