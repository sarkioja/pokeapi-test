import {
  PokemonRepositoryPort,
  PokemonPage,
} from '../../../domain/pokemon/pokemon.repository.port';

export class ListPokemonUseCase {
  constructor(private readonly pokemonRepository: PokemonRepositoryPort) {}

  async execute(limit: number, offset: number): Promise<PokemonPage> {
    return this.pokemonRepository.findAll(limit, offset);
  }
}
