import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import {
  POKEMON_REPOSITORY,
  PokemonRepositoryPort,
} from '../../domain/pokemon/pokemon.repository.port';
import { PaginationDto } from '../common/dto/pagination.dto';

const POKEMON_EXAMPLE = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  pokeapiId: 25,
  name: 'pikachu',
  types: ['electric'],
  spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  baseExperience: 112,
  height: 4,
  weight: 60,
  fetchedAt: '2026-05-02T21:00:00.000Z',
  createdAt: '2026-05-02T21:00:00.000Z',
  updatedAt: '2026-05-02T21:00:00.000Z',
};

const CHARIZARD_EXAMPLE = {
  id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  pokeapiId: 6,
  name: 'charizard',
  types: ['fire', 'flying'],
  spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
  baseExperience: 240,
  height: 17,
  weight: 905,
  fetchedAt: '2026-05-02T21:00:00.000Z',
  createdAt: '2026-05-02T21:00:00.000Z',
  updatedAt: '2026-05-02T21:00:00.000Z',
};

@ApiTags('pokemon')
@ApiSecurity('X-API-Key')
@Controller({ path: 'pokemon', version: '1' })
export class PokemonController {
  constructor(
    private readonly getOrFetch: GetOrFetchPokemonUseCase,
    @Inject(POKEMON_REPOSITORY)
    private readonly pokemonRepository: PokemonRepositoryPort,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List cached Pokémon (paginated)',
    description:
      'Returns all Pokémon currently stored in the local database. Does **not** trigger any PokéAPI fetch — only previously searched Pokémon appear here.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of locally cached Pokémon',
    schema: { example: { data: [POKEMON_EXAMPLE, CHARIZARD_EXAMPLE], total: 2 } },
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.pokemonRepository.findAll(pagination.limit, pagination.offset);
  }

  @Get(':nameOrId')
  @ApiOperation({
    summary: 'Get or fetch Pokémon by name or ID',
    description:
      'Returns a Pokémon from the local cache if fresh (TTL 24h, configurable via `POKEMON_TTL_HOURS`). If not cached or stale, fetches from PokéAPI and upserts by `pokeapi_id`. Pass a lowercase name (e.g. `pikachu`, `charizard`) or a numeric PokéAPI ID (e.g. `25`, `6`). If PokéAPI is unavailable but a stale record exists locally, it is returned as fallback.',
  })
  @ApiParam({
    name: 'nameOrId',
    description: 'Pokémon name (lowercase) or numeric PokéAPI ID',
    examples: {
      byName: { summary: 'By name', value: 'pikachu' },
      byId: { summary: 'By PokéAPI ID', value: '25' },
      dualType: { summary: 'Dual-type by name', value: 'charizard' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon data (from cache or freshly fetched)',
    schema: { example: POKEMON_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Pokémon not found in PokéAPI',
    schema: {
      example: { statusCode: 404, error: 'NOT_FOUND', message: 'Pokemon mewthree not found' },
    },
  })
  @ApiResponse({
    status: 502,
    description: 'PokéAPI unavailable and no cached record exists',
    schema: {
      example: {
        statusCode: 502,
        error: 'BAD_GATEWAY',
        message: 'PokéAPI is currently unavailable',
      },
    },
  })
  async findOne(@Param('nameOrId') nameOrId: string) {
    const asNumber = Number(nameOrId);
    if (!isNaN(asNumber) && asNumber > 0) {
      return this.getOrFetch.executeById(asNumber);
    }
    return this.getOrFetch.executeByName(nameOrId);
  }
}
