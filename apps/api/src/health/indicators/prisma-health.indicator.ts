import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import appConfig from '../../config/app.config';
import { PrismaService } from '../../integrations/prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  async isHealthy(
    key: string,
    options?: { checkRead?: boolean },
  ): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    const checkRead = options?.checkRead ?? true;

    if (!this.prismaService.isConfigured()) {
      if (this.appConfiguration.environment === 'production') {
        return indicator.down({
          configured: false,
          reachable: false,
          reason: 'DATABASE_URL is missing in production',
        });
      }

      return indicator.up({
        configured: false,
        reachable: false,
        mode: 'in-memory-fallback',
      });
    }

    if (!checkRead) {
      return indicator.up({ configured: true });
    }

    try {
      await this.prismaService.$queryRawUnsafe('SELECT 1');

      return indicator.up({ configured: true, reachable: true });
    } catch {
      return indicator.down({ configured: true, reachable: false });
    }
  }
}
