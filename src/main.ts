import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ValidationPipe } from './shared/pipes/validation.pipe';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const apiKeys = config.get<string>('API_KEYS', '');
  if (!apiKeys || apiKeys.trim() === '') {
    throw new Error('API_KEYS environment variable is required and cannot be empty');
  }

  app.use(helmet({
    hsts: false, // HSTS is managed at the load-balancer level (Render); disabling avoids Safari caching localhost as HTTPS-only
  }));

  const corsOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key'],
  });

  // Trust proxy so throttler reads X-Forwarded-For (required behind Render load balancer)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PokéAPI Test')
    .setDescription('REST API for managing Pokémon trainers, teams, and Pokémon')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
