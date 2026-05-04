import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  declare name: string;

  @ApiProperty()
  @IsUUID()
  declare trainerId: string;
}
