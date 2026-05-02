import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { POKEMON_REPOSITORY, PokemonRepositoryPort } from '../../domain/pokemon/pokemon.repository.port';
import { PaginationDto } from '../common/dto/pagination.dto';

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
    description: 'Returns all Pokémon currently stored in the local database. Does **not** trigger any PokéAPI fetch — only previously searched Pokémon appear here.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list — `{ data: [...], total: number }`' })
  findAll(@Query() pagination: PaginationDto) {
    return this.pokemonRepository.findAll(pagination.limit, pagination.offset);
  }

  @Get(':nameOrId')
  @ApiOperation({
    summary: 'Get or fetch Pokémon by name or ID',
    description: 'Returns a Pokémon from the local cache if fresh (TTL 24h, configurable via `POKEMON_TTL_HOURS`). If not cached or stale, fetches from PokéAPI and upserts by `pokeapi_id`. Pass a lowercase name (e.g. `pikachu`, `charizard`) or a numeric PokéAPI ID (e.g. `25`, `6`). If PokéAPI is unavailable but a stale record exists locally, it is returned as fallback.',
  })
  @ApiParam({ name: 'nameOrId', description: 'Pokémon name (e.g. pikachu) or numeric PokéAPI ID (e.g. 25)', example: 'pikachu' })
  @ApiResponse({ status: 200, description: 'Pokémon data (from cache or freshly fetched)' })
  @ApiResponse({ status: 404, description: 'Pokémon not found in PokéAPI' })
  @ApiResponse({ status: 502, description: 'PokéAPI unavailable and no cached record exists' })
  async findOne(@Param('nameOrId') nameOrId: string) {
    const asNumber = Number(nameOrId);
    if (!isNaN(asNumber) && asNumber > 0) {
      return this.getOrFetch.executeById(asNumber);
    }
    return this.getOrFetch.executeByName(nameOrId);
  }
}
