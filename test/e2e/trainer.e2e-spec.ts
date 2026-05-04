import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '../../src/shared/pipes/validation.pipe';
import { GlobalExceptionFilter } from '../../src/shared/filters/global-exception.filter';

const API_KEY = 'e2e-test-key';
const BASE = '/api/v1/trainers';

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

describe('Trainers (E2E)', () => {
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
    await ds.query('DELETE FROM teams');
    await ds.query('DELETE FROM trainers');
  });

  describe('POST /trainers', () => {
    it('returns 401 without API key', () => {
      return request(app.getHttpServer())
        .post(BASE)
        .send({ name: 'Ash', email: 'ash@test.com' })
        .expect(401);
    });

    it('returns 400 on invalid body', () => {
      return request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash' })
        .expect(400);
    });

    it('creates trainer and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash Ketchum', email: 'ash@test.com', favoritePokeapiId: 25 })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Ash Ketchum');
      expect(res.body.email).toBe('ash@test.com');
      expect(res.body.favoritePokeapiId).toBe(25);
    });

    it('returns 409 on duplicate email', async () => {
      await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      return request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash 2', email: 'ash@test.com' })
        .expect(409);
    });
  });

  describe('GET /trainers', () => {
    it('returns paginated list', async () => {
      await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });
      await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Misty', email: 'misty@test.com' });

      const res = await request(app.getHttpServer())
        .get(`${BASE}?limit=1&offset=0`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.total).toBe(2);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /trainers/:id', () => {
    it('returns trainer by id', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      const res = await request(app.getHttpServer())
        .get(`${BASE}/${created.id}`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.id).toBe(created.id);
    });

    it('returns 404 for unknown id', () => {
      return request(app.getHttpServer())
        .get(`${BASE}/00000000-0000-0000-0000-000000000000`)
        .set('X-API-Key', API_KEY)
        .expect(404);
    });
  });

  describe('PATCH /trainers/:id', () => {
    it('updates trainer name', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      const res = await request(app.getHttpServer())
        .patch(`${BASE}/${created.id}`)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash Champion' })
        .expect(200);

      expect(res.body.name).toBe('Ash Champion');
    });
  });

  describe('PATCH /trainers/:id/cep', () => {
    it('returns 400 for invalid CEP format', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      return request(app.getHttpServer())
        .patch(`${BASE}/${created.id}/cep`)
        .set('X-API-Key', API_KEY)
        .send({ cep: '123' })
        .expect(400);
    });
  });

  describe('DELETE /trainers/:id', () => {
    it('soft-deletes trainer and returns 204', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      await request(app.getHttpServer())
        .delete(`${BASE}/${created.id}`)
        .set('X-API-Key', API_KEY)
        .expect(204);

      await request(app.getHttpServer())
        .get(`${BASE}/${created.id}`)
        .set('X-API-Key', API_KEY)
        .expect(404);
    });
  });

  describe('PATCH /trainers/:id/restore', () => {
    it('restores soft-deleted trainer', async () => {
      const { body: created } = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      await request(app.getHttpServer()).delete(`${BASE}/${created.id}`).set('X-API-Key', API_KEY);

      const res = await request(app.getHttpServer())
        .patch(`${BASE}/${created.id}/restore`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.id).toBe(created.id);
    });

    it('returns 409 when email is taken after restore', async () => {
      const { body: first } = await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Ash', email: 'ash@test.com' });

      await request(app.getHttpServer()).delete(`${BASE}/${first.id}`).set('X-API-Key', API_KEY);

      // Another trainer takes the email while first is deleted
      await request(app.getHttpServer())
        .post(BASE)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Impostor', email: 'ash@test.com' });

      return request(app.getHttpServer())
        .patch(`${BASE}/${first.id}/restore`)
        .set('X-API-Key', API_KEY)
        .expect(409);
    });
  });
});
