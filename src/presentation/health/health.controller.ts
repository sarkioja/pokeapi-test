import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Checks database connectivity via a TCP ping. **No API key required.** Returns `{ status: "ok" }` when healthy, or `{ status: "error" }` with details when the database is unreachable.',
  })
  @ApiResponse({ status: 200, description: 'All systems operational' })
  @ApiResponse({ status: 503, description: 'Database unreachable' })
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
