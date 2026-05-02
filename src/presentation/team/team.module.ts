import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamOrmEntity } from '../../infrastructure/database/typeorm/entities/team.orm-entity';
import { TeamTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/team.typeorm-repository';
import { TEAM_REPOSITORY } from '../../domain/team/team.repository.port';
import { TrainerModule } from '../trainer/trainer.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { TeamController } from './team.controller';
import { CreateTeamUseCase } from '../../application/team/use-cases/create-team.use-case';
import { GetTeamUseCase } from '../../application/team/use-cases/get-team.use-case';
import { UpdateTeamUseCase } from '../../application/team/use-cases/update-team.use-case';
import { DeleteTeamUseCase } from '../../application/team/use-cases/delete-team.use-case';
import { AddPokemonToTeamUseCase } from '../../application/team/use-cases/add-pokemon-to-team.use-case';
import { RemovePokemonFromTeamUseCase } from '../../application/team/use-cases/remove-pokemon-from-team.use-case';
import { AnalyzeTeamTypesUseCase } from '../../application/team/use-cases/analyze-team-types.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamOrmEntity]),
    TrainerModule,
    PokemonModule,
  ],
  controllers: [TeamController],
  providers: [
    { provide: TEAM_REPOSITORY, useClass: TeamTypeOrmRepository },
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
    CreateTeamUseCase,
    GetTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
    AddPokemonToTeamUseCase,
    RemovePokemonFromTeamUseCase,
    AnalyzeTeamTypesUseCase,
  ],
})
export class TeamModule {}
