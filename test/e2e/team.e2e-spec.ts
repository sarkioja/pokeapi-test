import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '../../src/shared/pipes/validation.pipe';
import { GlobalExceptionFilter } from '../../src/shared/filters/global-exception.filter';

const API_KEY = 'e2e-test-key';
const TRAINERS = '/api/v1/trainers';
const TEAMS = '/api/v1/teams';

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

async function createTrainer(app: INestApplication, email = 'ash@test.com') {
  const res = await request(app.getHttpServer())
    .post(TRAINERS).set('X-API-Key', API_KEY).send({ name: 'Ash', email });
  return res.body as { id: string };
}

async function createTeam(app: INestApplication, trainerId: string, name = 'Dream Team') {
  const res = await request(app.getHttpServer())
    .post(TEAMS).set('X-API-Key', API_KEY).send({ name, trainerId });
  return res.body as { id: string; name: string; status: string; pokemon: unknown[] };
}

describe('Teams (E2E)', () => {
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
    await ds.query('DELETE FROM pokemon');
  });

  describe('POST /teams', () => {
    it('creates a team linked to a trainer', async () => {
      const trainer = await createTrainer(app);

      const res = await request(app.getHttpServer())
        .post(TEAMS).set('X-API-Key', API_KEY)
        .send({ name: 'Dream Team', trainerId: trainer.id })
        .expect(201);

      expect(res.body.name).toBe('Dream Team');
      expect(res.body.status).toBe('active');
      expect(res.body.pokemon).toHaveLength(0);
    });

    it('returns 404 when trainer does not exist', () => {
      return request(app.getHttpServer())
        .post(TEAMS).set('X-API-Key', API_KEY)
        .send({ name: 'Team', trainerId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });
  });

  describe('GET /trainers/:trainerId/teams', () => {
    it('lists teams for a trainer', async () => {
      const trainer = await createTrainer(app);
      await createTeam(app, trainer.id, 'Team A');
      await createTeam(app, trainer.id, 'Team B');

      const res = await request(app.getHttpServer())
        .get(`${TRAINERS}/${trainer.id}/teams`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.total).toBe(2);
    });
  });

  describe('GET /teams/:id', () => {
    it('returns team with pokemon roster', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      const res = await request(app.getHttpServer())
        .get(`${TEAMS}/${team.id}`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.id).toBe(team.id);
      expect(res.body.pokemon).toBeDefined();
    });

    it('returns 404 for unknown team', () => {
      return request(app.getHttpServer())
        .get(`${TEAMS}/00000000-0000-0000-0000-000000000000`)
        .set('X-API-Key', API_KEY)
        .expect(404);
    });
  });

  describe('PATCH /teams/:id', () => {
    it('updates team name', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      const res = await request(app.getHttpServer())
        .patch(`${TEAMS}/${team.id}`)
        .set('X-API-Key', API_KEY)
        .send({ name: 'Elite Four Squad' })
        .expect(200);

      expect(res.body.name).toBe('Elite Four Squad');
    });

    it('archives a team', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      const res = await request(app.getHttpServer())
        .patch(`${TEAMS}/${team.id}`)
        .set('X-API-Key', API_KEY)
        .send({ status: 'archived' })
        .expect(200);

      expect(res.body.status).toBe('archived');
    });
  });

  describe('POST /teams/:id/pokemon', () => {
    it('adds a pokemon to the team (fetches from PokéAPI)', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      const res = await request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'pikachu', nickname: 'Pika' })
        .expect(201);

      expect(res.body.pokemon).toHaveLength(1);
      expect(res.body.pokemon[0].nickname).toBe('Pika');
    }, 15000);

    it('returns 409 when same pokemon is added twice', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      await request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'pikachu' });

      return request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'pikachu' })
        .expect(409);
    }, 15000);

    it('returns 422 when team is archived', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);
      await request(app.getHttpServer())
        .patch(`${TEAMS}/${team.id}`).set('X-API-Key', API_KEY).send({ status: 'archived' });

      return request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'pikachu' })
        .expect(422);
    });

    it('returns 422 when team is full (6th pokemon)', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);
      const names = ['pikachu', 'charizard', 'bulbasaur', 'squirtle', 'gengar'];

      for (const name of names) {
        await request(app.getHttpServer())
          .post(`${TEAMS}/${team.id}/pokemon`)
          .set('X-API-Key', API_KEY)
          .send({ pokemonName: name });
      }

      return request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'mewtwo' })
        .expect(422);
    }, 60000);
  });

  describe('DELETE /teams/:teamId/pokemon/:pokemonId', () => {
    it('removes a pokemon from the team', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      const afterAdd = await request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'pikachu' });

      const slotId = afterAdd.body.pokemon[0].id;

      await request(app.getHttpServer())
        .delete(`${TEAMS}/${team.id}/pokemon/${slotId}`)
        .set('X-API-Key', API_KEY)
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`${TEAMS}/${team.id}`).set('X-API-Key', API_KEY);
      expect(res.body.pokemon).toHaveLength(0);
    }, 15000);
  });

  describe('DELETE /teams/:id', () => {
    it('soft-deletes a team and returns 204', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      await request(app.getHttpServer())
        .delete(`${TEAMS}/${team.id}`)
        .set('X-API-Key', API_KEY)
        .expect(204);

      await request(app.getHttpServer())
        .get(`${TEAMS}/${team.id}`)
        .set('X-API-Key', API_KEY)
        .expect(404);
    });
  });

  describe('GET /teams/:id/analysis', () => {
    it('returns type analysis for a team', async () => {
      const trainer = await createTrainer(app);
      const team = await createTeam(app, trainer.id);

      await request(app.getHttpServer())
        .post(`${TEAMS}/${team.id}/pokemon`)
        .set('X-API-Key', API_KEY)
        .send({ pokemonName: 'pikachu' });

      const res = await request(app.getHttpServer())
        .get(`${TEAMS}/${team.id}/analysis`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.weaknesses).toBeDefined();
      expect(res.body.resistances).toBeDefined();
      expect(res.body.immunities).toBeDefined();
    }, 15000);
  });
});
