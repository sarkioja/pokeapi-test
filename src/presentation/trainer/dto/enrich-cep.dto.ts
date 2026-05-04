import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class EnrichCepDto {
  @ApiProperty({ example: '01310100' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP must be 8 digits, optionally formatted as XXXXX-XXX' })
  declare cep: string;
}
