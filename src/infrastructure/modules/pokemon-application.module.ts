import { Module } from '@nestjs/common';
import {
  LOGGER_PORT,
  POKEAPI_PORT,
  POKEMON_CACHE_CONFIG,
  POKEMON_REPOSITORY,
} from '../../application/di/tokens';
import { PokeApiPort } from '../../domain/ports/pokeapi.port';
import { PokemonRepositoryPort } from '../../domain/pokemon/pokemon.repository.port';
import { PokemonPersistenceModule } from '../database/typeorm/pokemon-persistence.module';
import { PokeApiModule } from '../http-clients/pokeapi/pokeapi.module';
import { ApplicationConfigModule } from '../config/application-config.module';
import { LoggingModule } from '../logging/logging.module';
import { LoggerPort } from '../../application/ports/logger.port';
import { PokemonCacheConfigPort } from '../../application/ports/pokemon-cache-config.port';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { ListPokemonUseCase } from '../../application/pokemon/use-cases/list-pokemon.use-case';

@Module({
  imports: [PokemonPersistenceModule, PokeApiModule, ApplicationConfigModule, LoggingModule],
  providers: [
    {
      provide: GetOrFetchPokemonUseCase,
      inject: [POKEMON_REPOSITORY, POKEAPI_PORT, POKEMON_CACHE_CONFIG, LOGGER_PORT],
      useFactory: (
        pokemonRepository: PokemonRepositoryPort,
        pokeApi: PokeApiPort,
        config: PokemonCacheConfigPort,
        logger: LoggerPort,
      ) => new GetOrFetchPokemonUseCase(pokemonRepository, pokeApi, config, logger),
    },
    {
      provide: ListPokemonUseCase,
      inject: [POKEMON_REPOSITORY],
      useFactory: (pokemonRepository: PokemonRepositoryPort) =>
        new ListPokemonUseCase(pokemonRepository),
    },
  ],
  exports: [GetOrFetchPokemonUseCase, ListPokemonUseCase],
})
export class PokemonApplicationModule {}
