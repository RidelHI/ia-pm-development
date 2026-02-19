import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HealthService } from './health.service';

@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthService: HealthService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @HealthCheck()
  getLiveness() {
    return this.health.check([() => this.healthService.getLiveness()]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HealthCheck()
  getReadiness() {
    return this.health.check([
      () => this.healthService.getReadinessPrisma(),
      () => this.healthService.getReadinessMemory(),
    ]);
  }
}
