import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { envValidationSchema } from './infrastructure/config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ApiKeyGuard } from './shared/guards/api-key.guard';
import { TrainerModule } from './presentation/trainer/trainer.module';
import { TeamModule } from './presentation/team/team.module';
import { PokemonModule } from './presentation/pokemon/pokemon.module';
import { ViaCepModule } from './infrastructure/http-clients/viacep/viacep.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    ViaCepModule,
    TrainerModule,
    TeamModule,
    PokemonModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
