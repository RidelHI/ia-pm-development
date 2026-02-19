import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule, PrismaModule],
  exports: [SupabaseModule, PrismaModule],
})
export class IntegrationsModule {}
