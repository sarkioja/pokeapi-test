import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddPokemonDto {
  @ApiProperty({ example: 'pikachu' })
  @IsString()
  pokemonName: string;

  @ApiPropertyOptional({ example: 'Pika' })
  @IsOptional()
  @IsString()
  nickname?: string;
}
