import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { buildBaseDataSourceOptions } from './typeorm-base-options';

export function buildTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  return buildBaseDataSourceOptions(
    {
      databaseUrl: config.get<string>('DATABASE_URL'),
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_NAME'),
      schema: config.get<string>('DB_SCHEMA'),
      nodeEnv: config.get<string>('NODE_ENV', 'development'),
    },
    __dirname,
  ) as TypeOrmModuleOptions;
}
