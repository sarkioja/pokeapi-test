import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PokemonCacheConfigPort } from '../../application/ports/pokemon-cache-config.port';

@Injectable()
export class NestPokemonCacheConfigAdapter implements PokemonCacheConfigPort {
  constructor(private readonly config: ConfigService) {}

  getPokemonTtlHours(): number {
    return Number(this.config.get<number>('POKEMON_TTL_HOURS', 24));
  }

  getPokemonTypeTtlDays(): number {
    return Number(this.config.get<number>('POKEMON_TYPE_TTL_DAYS', 7));
  }
}
