import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SupabaseService } from '../integrations/supabase/supabase.service';
import { ProductsController } from './products.controller';
import { resolveProductsRepository } from './repositories/products-repository.provider';
import { InMemoryProductsRepository } from './repositories/in-memory-products.repository';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from './repositories/products.repository';
import { SupabaseProductsRepository } from './repositories/supabase-products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [IntegrationsModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    InMemoryProductsRepository,
    SupabaseProductsRepository,
    {
      provide: PRODUCTS_REPOSITORY,
      inject: [
        SupabaseService,
        SupabaseProductsRepository,
        InMemoryProductsRepository,
      ],
      useFactory: (
        supabaseService: SupabaseService,
        supabaseRepository: SupabaseProductsRepository,
        inMemoryRepository: InMemoryProductsRepository,
      ): ProductsRepository =>
        resolveProductsRepository(
          supabaseService,
          supabaseRepository,
          inMemoryRepository,
        ),
    },
  ],
})
export class ProductsModule {}
