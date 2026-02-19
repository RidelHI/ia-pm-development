import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../prisma/generated/client/client';
import databaseConfig from '../../config/database.config';

const DEFAULT_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly configured: boolean;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
  ) {
    const adapter = new PrismaPg(
      { connectionString: config.url ?? DEFAULT_DATABASE_URL },
      {
        schema: config.schema,
      },
    );

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    this.configured = Boolean(config.url);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async onModuleInit(): Promise<void> {
    if (!this.configured) {
      return;
    }

    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.configured) {
      return;
    }

    await this.$disconnect();
  }
}
