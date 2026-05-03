import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTrainerDto {
  @ApiProperty()
  @IsString()
  declare name: string;

  @ApiProperty()
  @IsEmail()
  declare email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  favoritePokeapiId?: number;
}
