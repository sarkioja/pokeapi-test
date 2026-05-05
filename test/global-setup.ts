import * as path from 'path';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { buildBaseDataSourceOptions } from '../src/infrastructure/database/typeorm-base-options';

export async function setupTestDatabase(schema = process.env.DB_SCHEMA ?? 'test') {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
    throw new Error(`Invalid test schema name: ${schema}`);
  }

  const cfg = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'pokeapi_dev',
  };

  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.username,
    password: cfg.password,
    database: cfg.database,
  });
  await client.connect();
  await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.end();

  const ds = new DataSource(
    buildBaseDataSourceOptions(
      { ...cfg, schema, nodeEnv: 'test', logging: false },
      path.join(__dirname, '../src/infrastructure/database'),
    ),
  );
  await ds.initialize();
  await ds.runMigrations();
  await ds.destroy();
}

export default async function globalSetup() {
  await setupTestDatabase();
}
