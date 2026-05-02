import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateTeamUseCase } from '../../application/team/use-cases/create-team.use-case';
import { GetTeamUseCase } from '../../application/team/use-cases/get-team.use-case';
import { UpdateTeamUseCase } from '../../application/team/use-cases/update-team.use-case';
import { DeleteTeamUseCase } from '../../application/team/use-cases/delete-team.use-case';
import { AddPokemonToTeamUseCase } from '../../application/team/use-cases/add-pokemon-to-team.use-case';
import { RemovePokemonFromTeamUseCase } from '../../application/team/use-cases/remove-pokemon-from-team.use-case';
import { AnalyzeTeamTypesUseCase } from '../../application/team/use-cases/analyze-team-types.use-case';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddPokemonDto } from './dto/add-pokemon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

const POKEMON_SLOT_EXAMPLE = {
  id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  slot: 1,
  nickname: 'Pika',
  addedAt: '2026-05-02T21:05:00.000Z',
  pokemon: {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    pokeapiId: 25,
    name: 'pikachu',
    types: ['electric'],
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    baseExperience: 112,
    height: 4,
    weight: 60,
  },
};

const TEAM_EXAMPLE = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  name: 'Dream Team',
  status: 'active',
  trainerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  pokemon: [POKEMON_SLOT_EXAMPLE],
  createdAt: '2026-05-02T21:00:00.000Z',
  updatedAt: '2026-05-02T21:05:00.000Z',
};

const ANALYSIS_EXAMPLE = {
  teamId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  weaknesses: { ground: 2 },
  resistances: { electric: 0.5, flying: 0.5, steel: 0.5 },
  immunities: {},
};

@ApiTags('teams')
@ApiSecurity('X-API-Key')
@Controller({ version: '1' })
export class TeamController {
  constructor(
    private readonly createTeam: CreateTeamUseCase,
    private readonly getTeam: GetTeamUseCase,
    private readonly updateTeam: UpdateTeamUseCase,
    private readonly deleteTeam: DeleteTeamUseCase,
    private readonly addPokemon: AddPokemonToTeamUseCase,
    private readonly removePokemon: RemovePokemonFromTeamUseCase,
    private readonly analyzeTypes: AnalyzeTeamTypesUseCase,
  ) {}

  @Post('teams')
  @ApiOperation({
    summary: 'Create a team',
    description: 'Creates a new team in `active` status linked to the given trainer. A trainer can have multiple teams.',
  })
  @ApiBody({
    type: CreateTeamDto,
    examples: {
      basic: {
        summary: 'Create team for a trainer',
        value: { name: 'Dream Team', trainerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Team created with empty Pokémon roster', schema: { example: { ...TEAM_EXAMPLE, pokemon: [] } } })
  @ApiResponse({ status: 400, description: 'Validation error', schema: { example: { statusCode: 400, error: 'BAD_REQUEST', message: 'trainerId must be a UUID' } } })
  @ApiResponse({ status: 404, description: 'Trainer not found', schema: { example: { statusCode: 404, error: 'NOT_FOUND', message: 'Trainer a1b2c3d4-e5f6-7890-abcd-ef1234567890 not found' } } })
  create(@Body() dto: CreateTeamDto) {
    return this.createTeam.execute(dto.name, dto.trainerId);
  }

  @Get('trainers/:trainerId/teams')
  @ApiOperation({
    summary: "List trainer's teams (paginated)",
    description: 'Returns a paginated list of all active (non-deleted) teams belonging to the trainer, ordered by creation date.',
  })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Paginated list of teams', schema: { example: { data: [TEAM_EXAMPLE], total: 1 } } })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  findByTrainer(@Param('trainerId') trainerId: string, @Query() pagination: PaginationDto) {
    return this.getTeam.findByTrainerId(trainerId, pagination.limit, pagination.offset);
  }

  @Get('teams/:id')
  @ApiOperation({
    summary: 'Get team with Pokémon',
    description: 'Returns the team with its full Pokémon roster (up to 5), including slot, nickname, types, and base stats for each Pokémon.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiResponse({ status: 200, description: 'Team found with Pokémon roster', schema: { example: TEAM_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Team not found or soft-deleted', schema: { example: { statusCode: 404, error: 'NOT_FOUND', message: 'Team b2c3d4e5-f6a7-8901-bcde-f12345678901 not found' } } })
  findOne(@Param('id') id: string) {
    return this.getTeam.findById(id);
  }

  @Patch('teams/:id')
  @ApiOperation({
    summary: 'Update team',
    description: 'Updates the team name and/or status. Setting `status` to `archived` prevents adding new Pokémon to the team. Archived teams can be unarchived by setting `status` back to `active`.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiBody({
    type: UpdateTeamDto,
    examples: {
      rename: {
        summary: 'Rename team',
        value: { name: 'Elite Four Squad' },
      },
      archive: {
        summary: 'Archive team (blocks new Pokémon)',
        value: { status: 'archived' },
      },
      unarchive: {
        summary: 'Reactivate archived team',
        value: { status: 'active' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Team updated', schema: { example: { ...TEAM_EXAMPLE, name: 'Elite Four Squad' } } })
  @ApiResponse({ status: 400, description: 'Validation error (invalid status value)', schema: { example: { statusCode: 400, error: 'BAD_REQUEST', message: 'status must be one of: active, archived' } } })
  @ApiResponse({ status: 404, description: 'Team not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.updateTeam.execute(id, dto);
  }

  @Delete('teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft-delete team',
    description: 'Soft-deletes the team. The Pokémon slots are preserved in the database for audit purposes but the team is no longer accessible via the API.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiResponse({ status: 204, description: 'Team soft-deleted (no body)' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  remove(@Param('id') id: string) {
    return this.deleteTeam.execute(id);
  }

  @Post('teams/:id/pokemon')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add Pokémon to team',
    description: 'Adds a Pokémon to the team by name. If the Pokémon is not in the local cache (or cache is stale, TTL 24h), it is fetched from PokéAPI and persisted. Business rules: max 5 Pokémon per team, no duplicates, team must not be archived.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiBody({
    type: AddPokemonDto,
    examples: {
      withNickname: {
        summary: 'Add Pikachu with nickname',
        value: { pokemonName: 'pikachu', nickname: 'Pika' },
      },
      withoutNickname: {
        summary: 'Add Charizard without nickname',
        value: { pokemonName: 'charizard' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Pokémon added to team', schema: { example: TEAM_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Team not found, or Pokémon not found in PokéAPI', schema: { example: { statusCode: 404, error: 'NOT_FOUND', message: 'Pokemon mewthree not found' } } })
  @ApiResponse({ status: 409, description: 'Pokémon already in this team', schema: { example: { statusCode: 409, error: 'CONFLICT', message: 'Pokemon is already in the team' } } })
  @ApiResponse({ status: 422, description: 'Team is full (max 5) or archived', schema: { example: { statusCode: 422, error: 'UNPROCESSABLE_ENTITY', message: 'Team is full (max 5 Pokémon)' } } })
  @ApiResponse({ status: 502, description: 'PokéAPI unavailable and Pokémon not cached locally' })
  addPokemonToTeam(@Param('id') id: string, @Body() dto: AddPokemonDto) {
    return this.addPokemon.execute(id, dto.pokemonName, dto.nickname);
  }

  @Delete('teams/:teamId/pokemon/:pokemonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove Pokémon from team',
    description: 'Removes a Pokémon from the team by its local UUID (the `id` field from the team roster, not the PokéAPI ID). The slot becomes available again.',
  })
  @ApiParam({ name: 'teamId', description: 'Team UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiParam({ name: 'pokemonId', description: 'TeamPokemon slot UUID (the `id` from the roster, not pokeapi_id)', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  @ApiResponse({ status: 204, description: 'Pokémon removed from team (no body)' })
  @ApiResponse({ status: 404, description: 'Team or Pokémon slot not found', schema: { example: { statusCode: 404, error: 'NOT_FOUND', message: 'Pokemon slot not found in team' } } })
  removePokemonFromTeam(@Param('teamId') teamId: string, @Param('pokemonId') pokemonId: string) {
    return this.removePokemon.execute(teamId, pokemonId);
  }

  @Get('teams/:id/analysis')
  @ApiOperation({
    summary: 'Analyze team type effectiveness',
    description: 'Calculates cumulative type effectiveness (weaknesses ×2/×4, resistances ×0.5/×0.25, immunities ×0) for all Pokémon in the team. Type data is cached locally (TTL 7 days) and fetched from PokéAPI on miss. Multipliers are accumulated multiplicatively across all team members.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiResponse({ status: 200, description: 'Type effectiveness analysis', schema: { example: ANALYSIS_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Team not found or empty', schema: { example: { statusCode: 404, error: 'NOT_FOUND', message: 'Team b2c3d4e5-f6a7-8901-bcde-f12345678901 not found' } } })
  analyze(@Param('id') id: string) {
    return this.analyzeTypes.execute(id);
  }
}
