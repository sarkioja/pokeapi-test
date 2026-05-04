import { Module } from '@nestjs/common';
import { PokemonApplicationModule } from '../../infrastructure/modules/pokemon-application.module';
import { PokemonController } from './pokemon.controller';

@Module({
  imports: [PokemonApplicationModule],
  controllers: [PokemonController],
})
export class PokemonModule {}
