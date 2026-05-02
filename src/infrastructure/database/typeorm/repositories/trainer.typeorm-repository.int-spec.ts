import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TrainerTypeOrmRepository } from './trainer.typeorm-repository';
import { TrainerOrmEntity } from '../entities/trainer.orm-entity';
import { TeamOrmEntity } from '../entities/team.orm-entity';
import { TeamPokemonOrmEntity } from '../entities/team-pokemon.orm-entity';
import { PokemonOrmEntity } from '../entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../entities/pokemon-type.orm-entity';

const ALL_ENTITIES = [TrainerOrmEntity, TeamOrmEntity, TeamPokemonOrmEntity, PokemonOrmEntity, PokemonTypeOrmEntity];

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

describe('TrainerTypeOrmRepository (integration)', () => {
  let module: TestingModule;
  let repo: TrainerTypeOrmRepository;
  let ds: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(DB),
        TypeOrmModule.forFeature(ALL_ENTITIES),
      ],
      providers: [TrainerTypeOrmRepository],
    }).compile();

    repo = module.get(TrainerTypeOrmRepository);
    ds = module.get(getDataSourceToken());
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await ds.query('DELETE FROM team_pokemon');
    await ds.query('DELETE FROM teams');
    await ds.query('DELETE FROM trainers');
  });

  it('creates and finds a trainer by id', async () => {
    const created = await repo.create({ name: 'Ash', email: 'ash@test.com' });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Ash');

    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found!.email).toBe('ash@test.com');
  });

  it('returns null when trainer does not exist', async () => {
    const found = await repo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeNull();
  });

  it('paginates trainers correctly', async () => {
    await repo.create({ name: 'Ash', email: 'ash@test.com' });
    await repo.create({ name: 'Misty', email: 'misty@test.com' });
    await repo.create({ name: 'Brock', email: 'brock@test.com' });

    const page = await repo.findAll(2, 0);
    expect(page.total).toBe(3);
    expect(page.data).toHaveLength(2);

    const page2 = await repo.findAll(2, 2);
    expect(page2.data).toHaveLength(1);
  });

  it('updates trainer fields', async () => {
    const created = await repo.create({ name: 'Ash', email: 'ash@test.com' });

    const updated = await repo.update(created.id, { name: 'Ash Champion', favoritePokeapiId: 25 });

    expect(updated.name).toBe('Ash Champion');
    expect(updated.favoritePokeapiId).toBe(25);
    expect(updated.email).toBe('ash@test.com');
  });

  it('updates trainer address from CEP lookup', async () => {
    const created = await repo.create({ name: 'Ash', email: 'ash@test.com' });

    const updated = await repo.updateAddress(created.id, {
      cep: '01310100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    });

    expect(updated.cep).toBe('01310100');
    expect(updated.addressCity).toBe('São Paulo');
    expect(updated.addressState).toBe('SP');
  });

  it('soft-deletes trainer (findById returns null after delete)', async () => {
    const created = await repo.create({ name: 'Ash', email: 'ash@test.com' });

    await repo.softDelete(created.id);

    expect(await repo.findById(created.id)).toBeNull();
  });

  it('restores soft-deleted trainer', async () => {
    const created = await repo.create({ name: 'Ash', email: 'ash@test.com' });
    await repo.softDelete(created.id);

    const restored = await repo.restore(created.id);

    expect(restored.id).toBe(created.id);
    expect(await repo.findById(created.id)).not.toBeNull();
  });

  it('existsActiveByEmail returns true for active email and false after soft-delete', async () => {
    const created = await repo.create({ name: 'Ash', email: 'ash@test.com' });

    expect(await repo.existsActiveByEmail('ash@test.com')).toBe(true);
    expect(await repo.existsActiveByEmail('ash@test.com', created.id)).toBe(false);

    await repo.softDelete(created.id);
    expect(await repo.existsActiveByEmail('ash@test.com')).toBe(false);
  });
});
