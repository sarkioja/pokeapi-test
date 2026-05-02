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
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a team' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  create(@Body() dto: CreateTeamDto) {
    return this.createTeam.execute(dto.name, dto.trainerId);
  }

  @Get('trainers/:trainerId/teams')
  @ApiOperation({ summary: "List trainer's teams (paginated)" })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  findByTrainer(@Param('trainerId') trainerId: string, @Query() pagination: PaginationDto) {
    return this.getTeam.findByTrainerId(trainerId, pagination.limit, pagination.offset);
  }

  @Get('teams/:id')
  @ApiOperation({ summary: 'Get team with pokemon' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.getTeam.findById(id);
  }

  @Patch('teams/:id')
  @ApiOperation({ summary: 'Update team name or status' })
  @ApiResponse({ status: 404 })
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.updateTeam.execute(id, dto);
  }

  @Delete('teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete team' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  remove(@Param('id') id: string) {
    return this.deleteTeam.execute(id);
  }

  @Post('teams/:id/pokemon')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add pokemon to team' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'Team or pokemon not found' })
  @ApiResponse({ status: 409, description: 'Duplicate pokemon' })
  @ApiResponse({ status: 422, description: 'Team full or archived' })
  addPokemonToTeam(@Param('id') id: string, @Body() dto: AddPokemonDto) {
    return this.addPokemon.execute(id, dto.pokemonName, dto.nickname);
  }

  @Delete('teams/:teamId/pokemon/:pokemonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove pokemon from team' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  removePokemonFromTeam(@Param('teamId') teamId: string, @Param('pokemonId') pokemonId: string) {
    return this.removePokemon.execute(teamId, pokemonId);
  }

  @Get('teams/:id/analysis')
  @ApiOperation({ summary: 'Analyze team type effectiveness' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  analyze(@Param('id') id: string) {
    return this.analyzeTypes.execute(id);
  }
}
