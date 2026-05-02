import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamOrmEntity } from '../../infrastructure/database/typeorm/entities/team.orm-entity';
import { TrainerOrmEntity } from '../../infrastructure/database/typeorm/entities/trainer.orm-entity';
import { PokemonOrmEntity } from '../../infrastructure/database/typeorm/entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from '../../infrastructure/database/typeorm/entities/pokemon-type.orm-entity';
import { TeamTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/team.typeorm-repository';
import { TrainerTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/trainer.typeorm-repository';
import { PokemonTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/pokemon.typeorm-repository';
import { TEAM_REPOSITORY } from '../../domain/team/team.repository.port';
import { TRAINER_REPOSITORY } from '../../domain/trainer/trainer.repository.port';
import { POKEMON_REPOSITORY } from '../../domain/pokemon/pokemon.repository.port';
import { POKEAPI_PORT } from '../../domain/ports/pokeapi.port';
import { PokeApiClient } from '../../infrastructure/http-clients/pokeapi/pokeapi.client';
import { CreateTeamUseCase } from '../../application/team/use-cases/create-team.use-case';
import { GetTeamUseCase } from '../../application/team/use-cases/get-team.use-case';
import { UpdateTeamUseCase } from '../../application/team/use-cases/update-team.use-case';
import { DeleteTeamUseCase } from '../../application/team/use-cases/delete-team.use-case';
import { AddPokemonToTeamUseCase } from '../../application/team/use-cases/add-pokemon-to-team.use-case';
import { RemovePokemonFromTeamUseCase } from '../../application/team/use-cases/remove-pokemon-from-team.use-case';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { AnalyzeTeamTypesUseCase } from '../../application/team/use-cases/analyze-team-types.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TeamOrmEntity, TrainerOrmEntity, PokemonOrmEntity, PokemonTypeOrmEntity])],
  providers: [
    { provide: TEAM_REPOSITORY, useClass: TeamTypeOrmRepository },
    { provide: TRAINER_REPOSITORY, useClass: TrainerTypeOrmRepository },
    { provide: POKEMON_REPOSITORY, useClass: PokemonTypeOrmRepository },
    { provide: POKEAPI_PORT, useClass: PokeApiClient },
    GetOrFetchPokemonUseCase,
    CreateTeamUseCase,
    GetTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
    AddPokemonToTeamUseCase,
    RemovePokemonFromTeamUseCase,
    AnalyzeTeamTypesUseCase,
  ],
  exports: [
    TEAM_REPOSITORY,
    TRAINER_REPOSITORY,
    POKEMON_REPOSITORY,
    CreateTeamUseCase,
    GetTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
    AddPokemonToTeamUseCase,
    RemovePokemonFromTeamUseCase,
    AnalyzeTeamTypesUseCase,
    GetOrFetchPokemonUseCase,
  ],
})
export class TeamModule {}
