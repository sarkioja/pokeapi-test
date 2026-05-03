import * as path from 'path';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { buildBaseDataSourceOptions } from '../src/infrastructure/database/typeorm-base-options';

export default async function globalSetup() {
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
  await client.query('DROP SCHEMA IF EXISTS test CASCADE');
  await client.query('CREATE SCHEMA test');
  await client.end();

  const ds = new DataSource(
    buildBaseDataSourceOptions(
      { ...cfg, schema: 'test', nodeEnv: 'test', logging: false },
      path.join(__dirname, '../src/infrastructure/database'),
    ),
  );
  await ds.initialize();
  await ds.runMigrations();
  await ds.destroy();
}
