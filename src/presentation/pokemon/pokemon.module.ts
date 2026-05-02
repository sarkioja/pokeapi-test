import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonOrmEntity } from '../../infrastructure/database/typeorm/entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../../infrastructure/database/typeorm/entities/pokemon-type.orm-entity';
import { PokemonTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/pokemon.typeorm-repository';
import { PokeApiClient } from '../../infrastructure/http-clients/pokeapi/pokeapi.client';
import { POKEMON_REPOSITORY } from '../../domain/pokemon/pokemon.repository.port';
import { POKEAPI_PORT } from '../../domain/ports/pokeapi.port';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { PokemonController } from './pokemon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PokemonOrmEntity, PokemonTypeOrmEntity])],
  controllers: [PokemonController],
  providers: [
    { provide: POKEMON_REPOSITORY, useClass: PokemonTypeOrmRepository },
    { provide: POKEAPI_PORT, useClass: PokeApiClient },
    GetOrFetchPokemonUseCase,
  ],
  exports: [POKEMON_REPOSITORY, GetOrFetchPokemonUseCase],
})
export class PokemonModule {}
