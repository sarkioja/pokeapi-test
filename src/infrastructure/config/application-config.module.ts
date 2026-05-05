import { Module } from '@nestjs/common';
import { POKEMON_CACHE_CONFIG } from '../di/tokens';
import { NestPokemonCacheConfigAdapter } from './nest-pokemon-cache-config.adapter';

@Module({
  providers: [
    NestPokemonCacheConfigAdapter,
    { provide: POKEMON_CACHE_CONFIG, useExisting: NestPokemonCacheConfigAdapter },
  ],
  exports: [POKEMON_CACHE_CONFIG],
})
export class ApplicationConfigModule {}
