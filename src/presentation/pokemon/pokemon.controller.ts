import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetOrFetchPokemonUseCase } from '../../application/pokemon/use-cases/get-or-fetch-pokemon.use-case';
import { POKEMON_REPOSITORY, PokemonRepositoryPort } from '../../domain/pokemon/pokemon.repository.port';
import { Inject } from '@nestjs/common';
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
  @ApiOperation({ summary: 'List cached pokemon (paginated)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.pokemonRepository.findAll(pagination.limit, pagination.offset);
  }

  @Get(':nameOrId')
  @ApiOperation({ summary: 'Get or fetch pokemon by name or pokeapi_id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 502, description: 'PokéAPI unavailable' })
  async findOne(@Param('nameOrId') nameOrId: string) {
    const asNumber = Number(nameOrId);
    if (!isNaN(asNumber) && asNumber > 0) {
      return this.getOrFetch.executeById(asNumber);
    }
    return this.getOrFetch.executeByName(nameOrId);
  }
}
