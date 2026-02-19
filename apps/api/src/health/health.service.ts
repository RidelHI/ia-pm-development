import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import appConfig from '../config/app.config';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator';

@Injectable()
export class HealthService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  getLiveness(): HealthIndicatorResult<'application'> {
    return {
      application: {
        status: 'up',
        service: this.appConfiguration.name,
        version: this.appConfiguration.version,
        environment: this.appConfiguration.environment,
        timestamp: new Date().toISOString(),
      },
    };
  }

  getReadinessPrisma(): Promise<HealthIndicatorResult<'prisma'>> {
    return this.prismaHealthIndicator.isHealthy('prisma', {
      checkRead: true,
    });
  }

  getReadinessMemory(): Promise<HealthIndicatorResult<'memory_heap'>> {
    return this.memoryHealthIndicator.checkHeap(
      'memory_heap',
      300 * 1024 * 1024,
    );
  }
}
