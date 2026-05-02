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
import { CreateTrainerUseCase } from '../../application/trainer/use-cases/create-trainer.use-case';
import { GetTrainerUseCase } from '../../application/trainer/use-cases/get-trainer.use-case';
import { UpdateTrainerUseCase } from '../../application/trainer/use-cases/update-trainer.use-case';
import { EnrichTrainerCepUseCase } from '../../application/trainer/use-cases/enrich-trainer-cep.use-case';
import { DeleteTrainerUseCase } from '../../application/trainer/use-cases/delete-trainer.use-case';
import { RestoreTrainerUseCase } from '../../application/trainer/use-cases/restore-trainer.use-case';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { EnrichCepDto } from './dto/enrich-cep.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('trainers')
@ApiSecurity('X-API-Key')
@Controller({ path: 'trainers', version: '1' })
export class TrainerController {
  constructor(
    private readonly createTrainer: CreateTrainerUseCase,
    private readonly getTrainer: GetTrainerUseCase,
    private readonly updateTrainer: UpdateTrainerUseCase,
    private readonly enrichCep: EnrichTrainerCepUseCase,
    private readonly deleteTrainer: DeleteTrainerUseCase,
    private readonly restoreTrainer: RestoreTrainerUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a trainer',
    description: 'Creates a new trainer. The email must be unique among active (non-deleted) trainers. `favoritePokeapiId` is an optional reference to a PokéAPI Pokémon ID (e.g. 25 for Pikachu).',
  })
  @ApiResponse({ status: 201, description: 'Trainer created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error (missing/invalid fields)' })
  @ApiResponse({ status: 409, description: 'Email already in use by an active trainer' })
  create(@Body() dto: CreateTrainerDto) {
    return this.createTrainer.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List trainers (paginated)',
    description: 'Returns a paginated list of all active (non-deleted) trainers. Use `limit` and `offset` for pagination.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of trainers — `{ data: [...], total: number }`' })
  findAll(@Query() pagination: PaginationDto) {
    return this.getTrainer.findAll(pagination.limit, pagination.offset);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get trainer by ID',
    description: 'Returns a single trainer by UUID. Soft-deleted trainers are not visible and return 404.',
  })
  @ApiParam({ name: 'id', description: 'Trainer UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Trainer found' })
  @ApiResponse({ status: 404, description: 'Trainer not found or soft-deleted' })
  findOne(@Param('id') id: string) {
    return this.getTrainer.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update trainer',
    description: 'Partially updates trainer name, email, or favorite Pokémon ID. All fields are optional. Email change is rejected if already taken by another active trainer.',
  })
  @ApiParam({ name: 'id', description: 'Trainer UUID' })
  @ApiResponse({ status: 200, description: 'Trainer updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  update(@Param('id') id: string, @Body() dto: UpdateTrainerDto) {
    return this.updateTrainer.execute(id, dto);
  }

  @Patch(':id/cep')
  @ApiOperation({
    summary: 'Enrich trainer address via ViaCEP',
    description: 'Looks up the Brazilian postal code (CEP) via the ViaCEP API and persists the full address (street, neighborhood, city, state) on the trainer. Accepts 8-digit CEP with or without hyphen (e.g. `01310-100` or `01310100`).',
  })
  @ApiParam({ name: 'id', description: 'Trainer UUID' })
  @ApiResponse({ status: 200, description: 'Address enriched and persisted on the trainer' })
  @ApiResponse({ status: 400, description: 'Invalid CEP format (must be 8 digits)' })
  @ApiResponse({ status: 404, description: 'Trainer not found, or CEP not found in ViaCEP' })
  @ApiResponse({ status: 502, description: 'ViaCEP API unavailable' })
  enrichCepAddress(@Param('id') id: string, @Body() dto: EnrichCepDto) {
    return this.enrichCep.execute(id, dto.cep);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft-delete trainer',
    description: 'Soft-deletes the trainer and cascades the soft-delete to all their teams in a single transaction. The record is preserved for audit and can be restored via `PATCH /trainers/:id/restore`.',
  })
  @ApiParam({ name: 'id', description: 'Trainer UUID' })
  @ApiResponse({ status: 204, description: 'Trainer and their teams soft-deleted' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  remove(@Param('id') id: string) {
    return this.deleteTrainer.execute(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restore soft-deleted trainer',
    description: 'Reactivates a previously soft-deleted trainer. Fails with 409 if another active trainer was created with the same email after the deletion (partial unique index on email WHERE deleted_at IS NULL).',
  })
  @ApiParam({ name: 'id', description: 'Trainer UUID' })
  @ApiResponse({ status: 200, description: 'Trainer restored' })
  @ApiResponse({ status: 404, description: 'Trainer not found (was never created or already restored)' })
  @ApiResponse({ status: 409, description: 'Email conflict — another active trainer uses this email' })
  restore(@Param('id') id: string) {
    return this.restoreTrainer.execute(id);
  }
}
