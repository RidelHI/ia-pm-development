import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [IntegrationsModule, HealthModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
