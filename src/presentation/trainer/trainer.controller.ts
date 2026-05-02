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
  @ApiOperation({ summary: 'Create a trainer' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  create(@Body() dto: CreateTrainerDto) {
    return this.createTrainer.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List trainers (paginated)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.getTrainer.findAll(pagination.limit, pagination.offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trainer by ID' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.getTrainer.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trainer name/email' })
  @ApiResponse({ status: 404 })
  update(@Param('id') id: string, @Body() dto: UpdateTrainerDto) {
    return this.updateTrainer.execute(id, dto);
  }

  @Patch(':id/cep')
  @ApiOperation({ summary: 'Enrich trainer address via ViaCEP' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Invalid CEP format' })
  @ApiResponse({ status: 404, description: 'Trainer or CEP not found' })
  enrichCepAddress(@Param('id') id: string, @Body() dto: EnrichCepDto) {
    return this.enrichCep.execute(id, dto.cep);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete trainer (cascades to teams)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  remove(@Param('id') id: string) {
    return this.deleteTrainer.execute(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted trainer' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409, description: 'Email conflict after restore' })
  restore(@Param('id') id: string) {
    return this.restoreTrainer.execute(id);
  }
}
