import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamOrmEntity } from '../../infrastructure/database/typeorm/entities/team.orm-entity';
import { TrainerOrmEntity } from '../../infrastructure/database/typeorm/entities/trainer.orm-entity';
import { TeamTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/team.typeorm-repository';
import { TrainerTypeOrmRepository } from '../../infrastructure/database/typeorm/repositories/trainer.typeorm-repository';
import { TEAM_REPOSITORY } from '../../domain/team/team.repository.port';
import { TRAINER_REPOSITORY } from '../../domain/trainer/trainer.repository.port';
import { CreateTeamUseCase } from '../../application/team/use-cases/create-team.use-case';
import { GetTeamUseCase } from '../../application/team/use-cases/get-team.use-case';
import { UpdateTeamUseCase } from '../../application/team/use-cases/update-team.use-case';
import { DeleteTeamUseCase } from '../../application/team/use-cases/delete-team.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([TeamOrmEntity, TrainerOrmEntity])],
  providers: [
    { provide: TEAM_REPOSITORY, useClass: TeamTypeOrmRepository },
    { provide: TRAINER_REPOSITORY, useClass: TrainerTypeOrmRepository },
    CreateTeamUseCase,
    GetTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
  ],
  exports: [
    TEAM_REPOSITORY,
    TRAINER_REPOSITORY,
    CreateTeamUseCase,
    GetTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
  ],
})
export class TeamModule {}
