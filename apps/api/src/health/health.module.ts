import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { HealthController } from './health.controller';
import { SupabaseHealthIndicator } from './indicators/supabase-health.indicator';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule, IntegrationsModule, AuthModule],
  controllers: [HealthController],
  providers: [HealthService, SupabaseHealthIndicator],
})
export class HealthModule {}
