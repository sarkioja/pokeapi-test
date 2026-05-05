import { Module } from '@nestjs/common';
import { PokeApiClient } from './pokeapi.client';
import { POKEAPI_PORT } from '../../di/tokens';

@Module({
  providers: [{ provide: POKEAPI_PORT, useClass: PokeApiClient }],
  exports: [POKEAPI_PORT],
})
export class PokeApiModule {}
