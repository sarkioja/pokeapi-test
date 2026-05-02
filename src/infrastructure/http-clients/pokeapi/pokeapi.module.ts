import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokeApiClient } from './pokeapi.client';
import { POKEAPI_PORT } from '../../../domain/ports/pokeapi.port';
import { PokemonOrmEntity } from '../../database/typeorm/entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../../database/typeorm/entities/pokemon-type.orm-entity';
import { PokemonTypeOrmRepository } from '../../database/typeorm/repositories/pokemon.typeorm-repository';
import { POKEMON_REPOSITORY } from '../../../domain/pokemon/pokemon.repository.port';
import { GetOrFetchPokemonUseCase } from '../../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([PokemonOrmEntity, PokemonTypeOrmEntity])],
  providers: [
    { provide: POKEAPI_PORT, useClass: PokeApiClient },
    { provide: POKEMON_REPOSITORY, useClass: PokemonTypeOrmRepository },
    GetOrFetchPokemonUseCase,
  ],
  exports: [POKEAPI_PORT, POKEMON_REPOSITORY, GetOrFetchPokemonUseCase],
})
export class PokeApiModule {}
