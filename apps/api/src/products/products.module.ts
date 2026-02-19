import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaService } from '../integrations/prisma/prisma.service';
import { ProductsController } from './products.controller';
import { resolveProductsRepository } from './repositories/products-repository.provider';
import { InMemoryProductsRepository } from './repositories/in-memory-products.repository';
import { PrismaProductsRepository } from './repositories/prisma-products.repository';
import { PRODUCTS_REPOSITORY } from './repositories/products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [IntegrationsModule, AuthModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    InMemoryProductsRepository,
    PrismaProductsRepository,
    {
      provide: PRODUCTS_REPOSITORY,
      inject: [
        PrismaService,
        PrismaProductsRepository,
        InMemoryProductsRepository,
      ],
      useFactory: async (
        prismaService: PrismaService,
        prismaRepository: PrismaProductsRepository,
        inMemoryRepository: InMemoryProductsRepository,
      ) =>
        await resolveProductsRepository(
          prismaService,
          prismaRepository,
          inMemoryRepository,
        ),
    },
  ],
})
export class ProductsModule {}
