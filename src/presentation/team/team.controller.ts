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
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({ status: 201, description: 'Team created with empty Pokémon roster' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  create(@Body() dto: CreateTeamDto) {
    return this.createTeam.execute(dto.name, dto.trainerId);
  }

  @Get('trainers/:trainerId/teams')
  @ApiOperation({
    summary: "List trainer's teams (paginated)",
    description: 'Returns a paginated list of all active (non-deleted) teams belonging to the trainer, ordered by creation date.',
  })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID' })
  @ApiResponse({ status: 200, description: 'Paginated list — `{ data: [...], total: number }`' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  findByTrainer(@Param('trainerId') trainerId: string, @Query() pagination: PaginationDto) {
    return this.getTeam.findByTrainerId(trainerId, pagination.limit, pagination.offset);
  }

  @Get('teams/:id')
  @ApiOperation({
    summary: 'Get team with Pokémon',
    description: 'Returns the team with its full Pokémon roster (up to 5), including slot, nickname, types, and base stats for each Pokémon.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiResponse({ status: 200, description: 'Team found with Pokémon roster' })
  @ApiResponse({ status: 404, description: 'Team not found or soft-deleted' })
  findOne(@Param('id') id: string) {
    return this.getTeam.findById(id);
  }

  @Patch('teams/:id')
  @ApiOperation({
    summary: 'Update team',
    description: 'Updates the team name and/or status. Setting `status` to `archived` prevents adding new Pokémon to the team. Archived teams can be unarchived by setting `status` back to `active`.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  @ApiResponse({ status: 400, description: 'Validation error (invalid status value)' })
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
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiResponse({ status: 204, description: 'Team soft-deleted' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  remove(@Param('id') id: string) {
    return this.deleteTeam.execute(id);
  }

  @Post('teams/:id/pokemon')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add Pokémon to team',
    description: 'Adds a Pokémon to the team by name. If the Pokémon is not in the local cache (or the cache is stale, TTL 24h), it is fetched from PokéAPI and persisted. Business rules: max 5 Pokémon per team, no duplicates, team must not be archived.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiResponse({ status: 201, description: 'Pokémon added to team' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Team not found, or Pokémon not found in PokéAPI' })
  @ApiResponse({ status: 409, description: 'Pokémon already in this team' })
  @ApiResponse({ status: 422, description: 'Team is full (max 5) or archived' })
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
  @ApiParam({ name: 'teamId', description: 'Team UUID' })
  @ApiParam({ name: 'pokemonId', description: 'TeamPokemon UUID (local slot ID, not pokeapi_id)' })
  @ApiResponse({ status: 204, description: 'Pokémon removed from team' })
  @ApiResponse({ status: 404, description: 'Team or Pokémon slot not found' })
  removePokemonFromTeam(@Param('teamId') teamId: string, @Param('pokemonId') pokemonId: string) {
    return this.removePokemon.execute(teamId, pokemonId);
  }

  @Get('teams/:id/analysis')
  @ApiOperation({
    summary: 'Analyze team type effectiveness',
    description: 'Calculates cumulative type effectiveness (weaknesses, resistances, immunities) for all Pokémon in the team. Type data is cached locally (TTL 7 days) and fetched from PokéAPI on miss. Multipliers are accumulated multiplicatively across all team members.',
  })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiResponse({ status: 200, description: 'Type analysis result — `{ weaknesses, resistances, immunities }` each as a map of type → multiplier' })
  @ApiResponse({ status: 404, description: 'Team not found or empty' })
  analyze(@Param('id') id: string) {
    return this.analyzeTypes.execute(id);
  }
}
