import { ListPokemonUseCase } from './list-pokemon.use-case';
import { PokemonRepositoryPort } from '../../../domain/pokemon/pokemon.repository.port';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';

const makePokemon = (overrides: Partial<Pokemon> = {}): Pokemon =>
  new Pokemon(
    overrides.id ?? 'id-1',
    overrides.pokeapiId ?? 25,
    overrides.name ?? 'pikachu',
    null,
    ['electric'],
    112,
    4,
    60,
    new Date(),
    new Date(),
    new Date(),
  );

const makeRepo = (): jest.Mocked<PokemonRepositoryPort> => ({
  upsertByPokeapiId: jest.fn(),
  findById: jest.fn(),
  findByPokeapiId: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  upsertType: jest.fn(),
  findTypeByName: jest.fn(),
});

describe('ListPokemonUseCase', () => {
  let useCase: ListPokemonUseCase;
  let repo: jest.Mocked<PokemonRepositoryPort>;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new ListPokemonUseCase(repo);
  });

  it('returns the page from the repository', async () => {
    const pokemon = [makePokemon({ id: 'id-1', name: 'pikachu' }), makePokemon({ id: 'id-2', pokeapiId: 6, name: 'charizard' })];
    repo.findAll.mockResolvedValue({ data: pokemon, total: 2 });

    const result = await useCase.execute(10, 0);

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('forwards limit and offset to the repository', async () => {
    repo.findAll.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute(5, 20);

    expect(repo.findAll).toHaveBeenCalledWith(5, 20);
  });

  it('returns empty page when no pokemon are cached', async () => {
    repo.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await useCase.execute(10, 0);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
