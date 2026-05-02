import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().uri().optional().allow(''),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().optional(),
  DB_PASSWORD: Joi.string().optional(),
  DB_NAME: Joi.string().optional(),
  DB_SCHEMA: Joi.string().optional(),

  POKEAPI_BASE_URL: Joi.string().uri().default('https://pokeapi.co/api/v2'),
  POKEMON_TTL_HOURS: Joi.number().default(24),
  POKEMON_TYPE_TTL_DAYS: Joi.number().default(7),
  HTTP_TIMEOUT_MS: Joi.number().default(5000),

  VIACEP_BASE_URL: Joi.string().uri().default('https://viacep.com.br/ws'),

  API_KEYS: Joi.string().min(1).required(),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
}).custom((value, helpers) => {
  if (!value.DATABASE_URL && (!value.DB_HOST || !value.DB_USERNAME || !value.DB_PASSWORD || !value.DB_NAME)) {
    return helpers.message({
      custom: 'Either DATABASE_URL or DB_HOST/DB_USERNAME/DB_PASSWORD/DB_NAME must be provided',
    });
  }
  return value;
});
