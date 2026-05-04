import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POKEMON_REPOSITORY } from '../../../application/di/tokens';
import { PokemonOrmEntity } from './entities/pokemon.orm-entity';
import { PokemonTypeOrmEntity } from './entities/pokemon-type.orm-entity';
import { PokemonTypeOrmRepository } from './repositories/pokemon.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([PokemonOrmEntity, PokemonTypeOrmEntity])],
  providers: [{ provide: POKEMON_REPOSITORY, useClass: PokemonTypeOrmRepository }],
  exports: [POKEMON_REPOSITORY],
})
export class PokemonPersistenceModule {}
