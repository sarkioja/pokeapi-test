import { Inject } from '@nestjs/common';
import {
  POKEMON_REPOSITORY,
  PokemonRepositoryPort,
  PokemonPage,
} from '../../../domain/pokemon/pokemon.repository.port';

export class ListPokemonUseCase {
  constructor(
    @Inject(POKEMON_REPOSITORY)
    private readonly pokemonRepository: PokemonRepositoryPort,
  ) {}

  async execute(limit: number, offset: number): Promise<PokemonPage> {
    return this.pokemonRepository.findAll(limit, offset);
  }
}
