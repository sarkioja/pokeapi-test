import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export interface DbEnv {
  databaseUrl?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  nodeEnv?: string;
  logging?: boolean;
}

export function buildBaseDataSourceOptions(
  env: DbEnv,
  basePath: string,
): DataSourceOptions {
  const isDev = env.nodeEnv === 'development';

  const logging: ('query' | 'error')[] =
    env.logging === undefined
      ? isDev ? ['query', 'error'] : ['error']
      : env.logging ? ['query', 'error'] : ['error'];

  const shared = {
    synchronize: false as const,
    migrationsRun: false as const,
    logging,
    entities: [join(basePath, 'typeorm/entities/**/*.orm-entity{.ts,.js}')],
    migrations: [join(basePath, 'typeorm/migrations/**/*{.ts,.js}')],
  };

  if (env.databaseUrl) {
    return {
      type: 'postgres',
      url: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
      ...shared,
    };
  }

  return {
    type: 'postgres',
    host: env.host ?? 'localhost',
    port: env.port ?? 5432,
    username: env.username ?? 'postgres',
    password: env.password ?? 'postgres',
    database: env.database ?? 'pokeapi_dev',
    ...shared,
  };
}
