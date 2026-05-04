import { Module } from '@nestjs/common';
import { TEAM_REPOSITORY, TRAINER_REPOSITORY } from '../../domain/di/tokens';
import { TeamRepositoryPort } from '../../domain/team/team.repository.port';
import { TrainerRepositoryPort } from '../../domain/trainer/trainer.repository.port';
import { TeamPersistenceModule } from '../database/typeorm/team-persistence.module';
import { TrainerPersistenceModule } from '../database/typeorm/trainer-persistence.module';
import { PokemonApplicationModule } from './pokemon-application.module';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { GetOrFetchTypeUseCase } from '../../application/pokemon/use-cases/get-or-fetch-type.use-case';
import { AddPokemonToTeamUseCase } from '../../application/team/use-cases/add-pokemon-to-team.use-case';
import { AnalyzeTeamTypesUseCase } from '../../application/team/use-cases/analyze-team-types.use-case';
import { CreateTeamUseCase } from '../../application/team/use-cases/create-team.use-case';
import { DeleteTeamUseCase } from '../../application/team/use-cases/delete-team.use-case';
import { GetTeamUseCase } from '../../application/team/use-cases/get-team.use-case';
import { RemovePokemonFromTeamUseCase } from '../../application/team/use-cases/remove-pokemon-from-team.use-case';
import { UpdateTeamUseCase } from '../../application/team/use-cases/update-team.use-case';

@Module({
  imports: [TeamPersistenceModule, TrainerPersistenceModule, PokemonApplicationModule],
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
      inject: [TEAM_REPOSITORY, GetOrFetchTypeUseCase],
      useFactory: (teamRepository: TeamRepositoryPort, getOrFetchType: GetOrFetchTypeUseCase) =>
        new AnalyzeTeamTypesUseCase(teamRepository, getOrFetchType),
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
