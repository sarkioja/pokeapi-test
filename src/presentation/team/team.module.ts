import { Module } from '@nestjs/common';
import { TeamApplicationModule } from '../../infrastructure/modules/team-application.module';
import { TeamController } from './team.controller';

@Module({
  imports: [TeamApplicationModule],
  controllers: [TeamController],
})
export class TeamModule {}
