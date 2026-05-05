import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '../../src/shared/pipes/validation.pipe';
import { GlobalExceptionFilter } from '../../src/shared/filters/global-exception.filter';
import { POKEAPI_PORT } from '../../src/infrastructure/di/tokens';
import { PokeApiPort } from '../../src/domain/ports/pokeapi.port';

const API_KEY = 'e2e-test-key';
const BASE = '/api/v1/pokemon';

async function createApp(): Promise<INestApplication> {
  process.env.API_KEYS = API_KEY;
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.init();
  return app;
}

describe('Pokemon (E2E)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    app = await createApp();
    ds = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await ds.query('DELETE FROM team_pokemon');
    await ds.query('DELETE FROM pokemon');
  });

  describe('GET /pokemon', () => {
    it('returns empty list when no pokemon cached', async () => {
      const res = await request(app.getHttpServer())
        .get(BASE)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('returns cached pokemon after a fetch', async () => {
      await request(app.getHttpServer()).get(`${BASE}/pikachu`).set('X-API-Key', API_KEY);

      const res = await request(app.getHttpServer())
        .get(BASE)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('pikachu');
    }, 15000);
  });

  describe('GET /pokemon/:nameOrId', () => {
    it('fetches and caches pikachu by name from PokéAPI', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/pikachu`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.name).toBe('pikachu');
      expect(res.body.pokeapiId).toBe(25);
      expect(res.body.types).toContain('electric');
    }, 15000);

    it('fetches pikachu by numeric pokeapi_id', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/25`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.name).toBe('pikachu');
    }, 15000);

    it('returns 200 from cache on second request (no PokéAPI call)', async () => {
      await request(app.getHttpServer()).get(`${BASE}/pikachu`).set('X-API-Key', API_KEY);

      const pokeApi = app.get<PokeApiPort>(POKEAPI_PORT);
      const spy = jest.spyOn(pokeApi, 'fetchPokemonByName');

      const res = await request(app.getHttpServer())
        .get(`${BASE}/pikachu`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.name).toBe('pikachu');
      expect(spy).not.toHaveBeenCalled();
    }, 15000);

    it('returns 404 for non-existent pokemon name', async () => {
      return request(app.getHttpServer())
        .get(`${BASE}/mewthree`)
        .set('X-API-Key', API_KEY)
        .expect(404);
    }, 15000);

    it('returns 401 without API key', () => {
      return request(app.getHttpServer()).get(`${BASE}/pikachu`).expect(401);
    });
  });
});
