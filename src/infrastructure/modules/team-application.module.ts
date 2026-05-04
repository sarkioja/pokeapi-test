import { Module } from '@nestjs/common';
import {
  LOGGER_PORT,
  POKEAPI_PORT,
  POKEMON_CACHE_CONFIG,
  POKEMON_REPOSITORY,
  TEAM_REPOSITORY,
  TRAINER_REPOSITORY,
} from '../../application/di/tokens';
import { PokeApiPort } from '../../domain/ports/pokeapi.port';
import { PokemonRepositoryPort } from '../../domain/pokemon/pokemon.repository.port';
import { TeamRepositoryPort } from '../../domain/team/team.repository.port';
import { TrainerRepositoryPort } from '../../domain/trainer/trainer.repository.port';
import { TeamPersistenceModule } from '../database/typeorm/team-persistence.module';
import { TrainerPersistenceModule } from '../database/typeorm/trainer-persistence.module';
import { PokemonPersistenceModule } from '../database/typeorm/pokemon-persistence.module';
import { PokeApiModule } from '../http-clients/pokeapi/pokeapi.module';
import { ApplicationConfigModule } from '../config/application-config.module';
import { LoggingModule } from '../logging/logging.module';
import { LoggerPort } from '../../application/ports/logger.port';
import { PokemonCacheConfigPort } from '../../application/ports/pokemon-cache-config.port';
import { PokemonApplicationModule } from './pokemon-application.module';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { AddPokemonToTeamUseCase } from '../../application/team/use-cases/add-pokemon-to-team.use-case';
import { AnalyzeTeamTypesUseCase } from '../../application/team/use-cases/analyze-team-types.use-case';
import { CreateTeamUseCase } from '../../application/team/use-cases/create-team.use-case';
import { DeleteTeamUseCase } from '../../application/team/use-cases/delete-team.use-case';
import { GetTeamUseCase } from '../../application/team/use-cases/get-team.use-case';
import { RemovePokemonFromTeamUseCase } from '../../application/team/use-cases/remove-pokemon-from-team.use-case';
import { UpdateTeamUseCase } from '../../application/team/use-cases/update-team.use-case';

@Module({
  imports: [
    TeamPersistenceModule,
    TrainerPersistenceModule,
    PokemonPersistenceModule,
    PokeApiModule,
    PokemonApplicationModule,
    ApplicationConfigModule,
    LoggingModule,
  ],
  providers: [
    {
      provide: CreateTeamUseCase,
      inject: [TEAM_REPOSITORY, TRAINER_REPOSITORY],
      useFactory: (teamRepository: TeamRepositoryPort, trainerRepository: TrainerRepositoryPort) =>
        new CreateTeamUseCase(teamRepository, trainerRepository),
    },
    {
      provide: GetTeamUseCase,
      inject: [TEAM_REPOSITORY, TRAINER_REPOSITORY],
      useFactory: (teamRepository: TeamRepositoryPort, trainerRepository: TrainerRepositoryPort) =>
        new GetTeamUseCase(teamRepository, trainerRepository),
    },
    {
      provide: UpdateTeamUseCase,
      inject: [TEAM_REPOSITORY],
      useFactory: (teamRepository: TeamRepositoryPort) => new UpdateTeamUseCase(teamRepository),
    },
    {
      provide: DeleteTeamUseCase,
      inject: [TEAM_REPOSITORY],
      useFactory: (teamRepository: TeamRepositoryPort) => new DeleteTeamUseCase(teamRepository),
    },
    {
      provide: AddPokemonToTeamUseCase,
      inject: [TEAM_REPOSITORY, GetOrFetchPokemonUseCase],
      useFactory: (
        teamRepository: TeamRepositoryPort,
        getOrFetchPokemon: GetOrFetchPokemonUseCase,
      ) => new AddPokemonToTeamUseCase(teamRepository, getOrFetchPokemon),
    },
    {
      provide: RemovePokemonFromTeamUseCase,
      inject: [TEAM_REPOSITORY],
      useFactory: (teamRepository: TeamRepositoryPort) =>
        new RemovePokemonFromTeamUseCase(teamRepository),
    },
    {
      provide: AnalyzeTeamTypesUseCase,
      inject: [
        TEAM_REPOSITORY,
        POKEMON_REPOSITORY,
        POKEAPI_PORT,
        POKEMON_CACHE_CONFIG,
        LOGGER_PORT,
      ],
      useFactory: (
        teamRepository: TeamRepositoryPort,
        pokemonRepository: PokemonRepositoryPort,
        pokeApi: PokeApiPort,
        config: PokemonCacheConfigPort,
        logger: LoggerPort,
      ) => new AnalyzeTeamTypesUseCase(teamRepository, pokemonRepository, pokeApi, config, logger),
    },
  ],
  exports: [
    CreateTeamUseCase,
    GetTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
    AddPokemonToTeamUseCase,
    RemovePokemonFromTeamUseCase,
    AnalyzeTeamTypesUseCase,
  ],
})
export class TeamApplicationModule {}
