import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TEAM_REPOSITORY } from '../../di/tokens';
import { TeamOrmEntity } from './entities/team.orm-entity';
import { TeamTypeOrmRepository } from './repositories/team.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([TeamOrmEntity])],
  providers: [{ provide: TEAM_REPOSITORY, useClass: TeamTypeOrmRepository }],
  exports: [TEAM_REPOSITORY],
})
export class TeamPersistenceModule {}
