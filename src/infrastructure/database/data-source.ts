import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { buildBaseDataSourceOptions } from './typeorm-base-options';

config();

export const AppDataSource = new DataSource(
  buildBaseDataSourceOptions(
    {
      databaseUrl: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      nodeEnv: process.env.NODE_ENV,
      logging: false,
    },
    __dirname,
  ),
);
