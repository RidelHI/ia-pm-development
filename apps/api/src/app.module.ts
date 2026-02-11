import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { validateEnvironment } from './config/environment.validation';
import supabaseConfig from './config/supabase.config';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        `apps/api/.env.${process.env.NODE_ENV ?? 'development'}.local`,
        `apps/api/.env.${process.env.NODE_ENV ?? 'development'}`,
        'apps/api/.env.local',
        'apps/api/.env',
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env.local',
        '.env',
      ],
      load: [appConfig, supabaseConfig],
      validate: validateEnvironment,
    }),
    IntegrationsModule,
    HealthModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
